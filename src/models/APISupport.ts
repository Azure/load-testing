import { isNull, isNullOrUndefined } from "util";
import { AuthenticationUtils } from "./AuthenticationUtils";
import { ApiVersionConstants, CallTypeForDP, FileType, reportZipFileName, resultZipFileName } from "./UtilModels";
import { TestKind } from "./engine/TestKind";
import * as Util from './util';
import * as FileUtils from './FileUtils';
import * as core from '@actions/core';
import { FileInfo, TestModel, ExistingParams, TestRunModel, AppComponents, ServerMetricConfig } from "./PayloadModels";
import { YamlConfig } from "./TaskModels";
import * as FetchUtil from './FetchHelper';

export class APISupport {
    authContext : AuthenticationUtils;
    yamlModel: YamlConfig;
    baseURL = '';
    existingParams: ExistingParams = {secrets: {}, env: {}, passFailCriteria: {}, appComponents: new Map()};
    testId: string;

    constructor(authContext: AuthenticationUtils, yamlModel: YamlConfig) {
        this.authContext = authContext;
        this.yamlModel = yamlModel;
        this.testId = this.yamlModel.testId;
    }

    async getResource() {
        let id = this.authContext.resourceId;
        let armUrl = this.authContext.armEndpoint;
        let armEndpointSuffix = id + "?api-version=" + ApiVersionConstants.cp2022Version;
        let armEndpoint = new URL(armEndpointSuffix, armUrl);
        let header = await this.authContext.armTokenHeader();
        let response = await FetchUtil.httpClientRetries(armEndpoint.toString(),header,'get',3,"");
        let resource_name: string | undefined = core.getInput('loadTestResource');
        if(response.message.statusCode == 404) {
            var message = `The Azure Load Testing resource ${resource_name} does not exist. Please provide an existing resource.`;
            throw new Error(message);
        }
        let respObj:any = await Util.getResultObj(response);
        if(response.message.statusCode != 200){
            console.log(respObj ? respObj : Util.ErrorCorrection(response));
            throw new Error("Error fetching resource " + resource_name);
        }
        let dataPlaneUrl = respObj.properties.dataPlaneURI;
        this.baseURL = 'https://'+dataPlaneUrl+'/';
    }

    async getTestAPI(validate:boolean, returnTestObj:boolean = false) : Promise<[string | undefined, TestModel] | string | undefined> {
        var urlSuffix = "tests/"+this.testId+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.get);
        let testResult = await FetchUtil.httpClientRetries(urlSuffix,header,'get',3,"");
        if(testResult.message.statusCode == 401 || testResult.message.statusCode == 403){
            var message = "Service Principal does not have sufficient permissions. Please assign " 
            +"the Load Test Contributor role to the service principal. Follow the steps listed at "
            +"https://docs.microsoft.com/azure/load-testing/tutorial-cicd-github-actions#configure-the-github-actions-workflow-to-run-a-load-test ";

            throw new Error(message);
        }

        if(testResult.message.statusCode != 200 && testResult.message.statusCode != 201){
            if(validate){ // validate is called, then get should not be false, and this validate had retries because of the conflicts in jmx test, so lets not print in the console, instead put this in the error itself.
                let errorObj:any=await Util.getResultObj(testResult);
                let err = errorObj?.error?.message ? errorObj?.error?.message : Util.ErrorCorrection(testResult);
                throw new Error(err);
            } else if(!validate && testResult.message.statusCode != 404){ // if not validate, then its to check if it is edit or create thats all, so it should not throw the error for 404.
                let testObj:any=await Util.getResultObj(testResult);
                console.log(testObj ? testObj : Util.ErrorCorrection(testResult));
                throw new Error("Error in getting the test.");
            }
            // note : kumarmoh 
            /// else {
            //    do nothing if the validate = false and status code is 404, as it is for create test.
            // } this is just for comment
        }
        if(testResult.message.statusCode == 200) {
            let testObj: TestModel =await Util.getResultObj(testResult);
            if(testObj == null){
                throw new Error(Util.ErrorCorrection(testResult));
            }
            let inputScriptFileInfo: FileInfo | undefined = testObj.kind == TestKind.URL ? testObj.inputArtifacts?.urlTestConfigFileInfo :testObj.inputArtifacts?.testScriptFileInfo;
            
            if(validate) {
                if (returnTestObj) {
                    return [inputScriptFileInfo?.validationStatus, testObj];
                }
                return inputScriptFileInfo?.validationStatus;
            }
            else
            {
                if(!isNullOrUndefined(testObj.passFailCriteria) && !isNullOrUndefined(testObj.passFailCriteria.passFailMetrics))
                    this.existingParams.passFailCriteria = testObj.passFailCriteria.passFailMetrics;
                if(testObj.secrets != null){
                    this.existingParams.secrets = testObj.secrets;
                }
                if(testObj.environmentVariables != null){
                    this.existingParams.env = testObj.environmentVariables;
                }
            }
        }
    }
    
    async getAppComponents() {
        let urlSuffix = "tests/"+this.testId+"/app-components/"+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.get);
        let appComponentsResult = await FetchUtil.httpClientRetries(urlSuffix,header,'get',3,"");
        if(appComponentsResult.message.statusCode == 200) {
            let appComponentsObj:AppComponents = await Util.getResultObj(appComponentsResult);
            for(let guid in appComponentsObj.components){
                let resourceId = appComponentsObj.components[guid]?.resourceId ?? "";
                if(this.existingParams.appComponents.has(resourceId?.toLowerCase())) {
                    let existingGuids = this.existingParams.appComponents.get(resourceId?.toLowerCase()) ?? [];
                    existingGuids.push(guid);
                    this.existingParams.appComponents.set(resourceId.toLowerCase(), existingGuids);
                } else {
                    this.existingParams.appComponents.set(resourceId.toLowerCase(), [guid]);
                }
            }
        }
    }

    async getServerMetricsConfig() {
        let urlSuffix = "tests/"+this.testId+"/server-metrics-config/"+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.get);
        let serverComponentsResult = await FetchUtil.httpClientRetries(urlSuffix,header,'get',3,"");
        if(serverComponentsResult.message.statusCode == 200) {
            let serverComponentsObj: ServerMetricConfig = await Util.getResultObj(serverComponentsResult);
            this.yamlModel.mergeExistingServerCriteria(serverComponentsObj);
        }
    }

    async deleteFileAPI(filename:string) {
        var urlSuffix = "tests/"+this.testId+"/files/"+filename+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.delete);
        let delFileResult = await FetchUtil.httpClientRetries(urlSuffix,header,'del',3,"");
        if(delFileResult.message.statusCode != 204) {
            let errorObj:any=await Util.getResultObj(delFileResult);
            let Message: string = errorObj ? errorObj.message : Util.ErrorCorrection(delFileResult);
            throw new Error(Message);
        }
    }

    async createTestAPI() {
        let urlSuffix = "tests/"+this.testId+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let createData = this.yamlModel.getCreateTestData(this.existingParams);
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.patch);
        let createTestresult = await FetchUtil.httpClientRetries(urlSuffix,header,'patch',3,JSON.stringify(createData));
        if(createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
            let errorObj:any=await Util.getResultObj(createTestresult);
            console.log(errorObj ? errorObj : Util.ErrorCorrection(createTestresult));
            throw new Error("Error in creating test: " + this.testId);
        }
        if(createTestresult.message.statusCode == 201) {
            console.log("Creating a new load test "+this.testId);
            console.log("Successfully created load test "+this.testId);
        }
        else {
            console.log("Test '"+ this.testId +"' already exists");
            // test script will anyway be updated by the ado in later steps, this will be error if the test script is not present in the test.
            // this will be error in the url tests when the quick test is getting updated to the url test. so removing this.
            let testObj:any=await Util.getResultObj(createTestresult);
            var testFiles = testObj.inputArtifacts;
            if(testFiles.userPropUrl != null){
                console.log(`Deleting the existing UserProperty file.`);
                await this.deleteFileAPI(testFiles.userPropFileInfo.fileName);
            }
            if(testFiles.testScriptFileInfo != null){
                console.log(`Deleting the existing TestScript file.`);
                await this.deleteFileAPI(testFiles.testScriptFileInfo.fileName);
            }
            if(testFiles.additionalFileInfo != null){
                // delete existing files which are not present in yaml, the files which are in yaml will anyway be uploaded again.
                let existingFiles : string[] = [];
                let file : any;
                for(file of testFiles.additionalFileInfo){
                    existingFiles.push(file.fileName);
                }
                for(let file of this.yamlModel.configurationFiles){
                    file = this.yamlModel.getFileName(file);
                    let indexOfFile = existingFiles.indexOf(file);
                    if(indexOfFile != -1){
                        existingFiles.splice(indexOfFile, 1);
                    }
                }
                for(let file of this.yamlModel.zipArtifacts){
                    file = this.yamlModel.getFileName(file);
                    let indexOfFile = existingFiles.indexOf(file);
                    if(indexOfFile != -1){
                        existingFiles.splice(indexOfFile, 1);
                    }
                }
                if(existingFiles.length > 0){
                    console.log(`Deleting the ${existingFiles.length} existing test file(s) which is(are) not in the configuration yaml file.`);
                }
                for(const file of existingFiles){
                    await this.deleteFileAPI(file);
                }
            }
        }
        await this.uploadConfigFile();
    }

    async patchAppComponents() {
        let urlSuffix = "tests/"+this.testId+"/app-components/"+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let appComponentsData : AppComponents = this.yamlModel.getAppComponentsData();
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.patch);
        let appComponentsResult = await FetchUtil.httpClientRetries(urlSuffix,header,'patch',3,JSON.stringify(appComponentsData));
        if(appComponentsResult.message.statusCode != 200 && appComponentsResult.message.statusCode != 201) {
            let errorObj:any=await Util.getResultObj(appComponentsResult);
            console.log(errorObj ? errorObj : Util.ErrorCorrection(appComponentsResult));
            throw new Error("Error in updating app components");
        } else {
            console.log("Updated app components successfully");
            let appComponentsObj:AppComponents = await Util.getResultObj(appComponentsResult);
            for(let guid in appComponentsObj.components){
                let resourceId = appComponentsObj.components[guid]?.resourceId ?? "";
                if(this.existingParams.appComponents.has(resourceId?.toLowerCase())) {
                    let existingGuids = this.existingParams.appComponents.get(resourceId?.toLowerCase()) ?? [];
                    existingGuids.push(guid);
                    this.existingParams.appComponents.set(resourceId.toLowerCase(), existingGuids);
                } else {
                    this.existingParams.appComponents.set(resourceId.toLowerCase(), [guid]);
                }
            }
            await this.getServerMetricsConfig();
            await this.patchServerMetrics();
        }
    }

    async patchServerMetrics() {
        let urlSuffix = "tests/"+this.testId+"/server-metrics-config/"+"?api-version="+ ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        let serverMetricsData : ServerMetricConfig = {
            metrics: this.yamlModel.serverMetricsConfig
        }
        let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.patch);
        let serverMetricsResult = await FetchUtil.httpClientRetries(urlSuffix,header,'patch',3,JSON.stringify(serverMetricsData));
        if(serverMetricsResult.message.statusCode != 200 && serverMetricsResult.message.statusCode != 201) {
            let errorObj:any=await Util.getResultObj(serverMetricsResult);
            console.log(errorObj ? errorObj : Util.ErrorCorrection(serverMetricsResult));
            throw new Error("Error in updating server metrics");
        } else {
            console.log("Updated server metrics successfully");
        }
    }

    async uploadTestPlan() 
    {
        let retry = 5;
        let filepath = this.yamlModel.testPlan;
        let filename = this.yamlModel.getFileName(filepath);
        let urlSuffix = "tests/"+this.testId+"/files/"+filename+"?api-version="+ ApiVersionConstants.latestVersion;
        
        let fileType = FileType.TEST_SCRIPT;
        if(this.yamlModel.kind == TestKind.URL){
            fileType = FileType.URL_TEST_CONFIG;
        }
        urlSuffix = this.baseURL + urlSuffix + ("&fileType=" + fileType);
        
        let headers = await this.authContext.getDataPlaneHeader(CallTypeForDP.put)
        let uploadresult = await FetchUtil.httpClientRetries(urlSuffix,headers,'put',3,filepath, true);
        if(uploadresult.message.statusCode != 201){
            let errorObj:any = await Util.getResultObj(uploadresult);
            console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
            throw new Error("Error in uploading TestPlan for the created test");
        }
        else {
            console.log("Uploaded test plan for the test");
            let minutesToAdd=10;
            let startTime = new Date();
            let maxAllowedTime = new Date(startTime.getTime() + minutesToAdd*60000);
            let validationStatus : string | undefined = "VALIDATION_INITIATED";
            let testObj: TestModel | null = null;
            while(maxAllowedTime>(new Date()) && (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED" || validationStatus == null)) {
                try{
                    [validationStatus, testObj] = await this.getTestAPI(true, true) as [string | undefined, TestModel];
                }
                catch(e) {
                    retry--;
                    if(retry == 0){
                        throw new Error("Unable to validate the test plan. Please retry. Failed with error :" + e);
                    }
                }
                await Util.sleep(5000);
            }
            await this.patchAppComponents();
            console.log("Validation status of the test plan: "+ validationStatus);
            if(validationStatus == null || validationStatus == "VALIDATION_SUCCESS" ){
                console.log(`Validated test plan for the test successfully.`);
                
                // Get errors from all files
                let fileErrors = Util.getAllFileErrors(testObj);

                if (Object.keys(fileErrors).length > 0) {
                    console.log("Validation failed for the following files:");
                    for (const [file, error] of Object.entries(fileErrors)) {
                        console.log(`File: ${file}, Error: ${error}`);
                    }
                    throw new Error("Validation of one or more files failed. Please correct the errors and try again.");
                }

                await this.createTestRun();
            }
            else if(validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")
                throw new Error("TestPlan validation timeout. Please try again.")
            else
                throw new Error("TestPlan validation Failed.");
        }
    }

    async uploadConfigFile() 
    {
        let configFiles = this.yamlModel.configurationFiles;
        if(configFiles != undefined && configFiles.length > 0) {
            for(let filepath of configFiles){
                let filename = this.yamlModel.getFileName(filepath);
                let urlSuffix = "tests/"+ this.testId +"/files/"+filename+"?api-version="+ ApiVersionConstants.latestVersion + ("&fileType=" + FileType.ADDITIONAL_ARTIFACTS);
                urlSuffix = this.baseURL+urlSuffix;
                let headers = await this.authContext.getDataPlaneHeader(CallTypeForDP.put);
                let uploadresult = await FetchUtil.httpClientRetries(urlSuffix,headers,'put',3,filepath, true);
                if(uploadresult.message.statusCode != 201){
                    let errorObj:any = await Util.getResultObj(uploadresult);
                    console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                    throw new Error("Error in uploading config file for the created test");
                }
            };
            console.log(`Uploaded ${configFiles.length} configuration file(s) for the test successfully.`);
        }
        await this.uploadZipArtifacts();
    }

    async uploadZipArtifacts()
    {
        let zipFiles = this.yamlModel.zipArtifacts;
        if(zipFiles != undefined && zipFiles.length > 0) {
            console.log("Uploading and validating the zip artifacts");
            for(const filepath of zipFiles){
                let filename = this.yamlModel.getFileName(filepath);
                var urlSuffix = "tests/"+this.testId+"/files/"+filename+"?api-version=" + ApiVersionConstants.latestVersion+"&fileType="+FileType.ZIPPED_ARTIFACTS;
                urlSuffix = this.baseURL+urlSuffix;
                let headers = await this.authContext.getDataPlaneHeader(CallTypeForDP.put);
                let uploadresult = await FetchUtil.httpClientRetries(urlSuffix,headers,'put',3,filepath, true);
                if(uploadresult.message.statusCode != 201){
                    let errorObj:any = await Util.getResultObj(uploadresult);
                    console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                    throw new Error("Error in uploading config file for the created test");
                }
            }
            console.log(`Uploaded ${zipFiles.length} zip artifact(s) for the test successfully.`);
        }
        let statuscode = await this.uploadPropertyFile();
        if(statuscode== 201)
            await this.uploadTestPlan();
    }

    async uploadPropertyFile()
    {
        let propertyFile = this.yamlModel.propertyFile;
        if(propertyFile != undefined && propertyFile!= '') {
            let filename = this.yamlModel.getFileName(propertyFile);
            let urlSuffix = "tests/"+this.testId+"/files/"+filename+"?api-version="+ ApiVersionConstants.latestVersion+"&fileType="+FileType.USER_PROPERTIES;
            urlSuffix = this.baseURL + urlSuffix;
            let headers = await this.authContext.getDataPlaneHeader(CallTypeForDP.put);
            let uploadresult = await FetchUtil.httpClientRetries(urlSuffix,headers,'put',3,propertyFile, true);
            if(uploadresult.message.statusCode != 201){
                let errorObj:any = await Util.getResultObj(uploadresult);
                console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                throw new Error("Error in uploading TestPlan for the created test");
            }
            console.log(`Uploaded user properties file for the test successfully.`);
        }
        return 201;
    }

    async createTestRun() {
        try {
            var startData = this.yamlModel.getStartTestData();
            const testRunId = this.yamlModel.runTimeParams.testRunId;
            let urlSuffix = "test-runs/"+testRunId+"?api-version=" + ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL+urlSuffix;

            console.log("Creating and running a testRun for the test");
            let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.patch);
            let startTestresult = await FetchUtil.httpClientRetries(urlSuffix,header,'patch',3,JSON.stringify(startData));
            let testRunDao:any=await Util.getResultObj(startTestresult);
            if(startTestresult.message.statusCode != 200 && startTestresult.message.statusCode != 201){
                console.log(testRunDao ? testRunDao : Util.ErrorCorrection(startTestresult));
                throw new Error("Error in running the test");
            }
            let startTime = new Date();
            let status = testRunDao.status;
            if(status == "ACCEPTED") {
                console.log("\nView the load test run in Azure portal by following the steps:")
                console.log("1. Go to your Azure Load Testing resource '"+Util.getResourceNameFromResourceId(this.authContext.resourceId)+"' in subscription '"+Util.getSubscriptionIdFromResourceId(this.authContext.resourceId)+"'")
                console.log("2. On the Tests page, go to test '"+this.testId+"'")
                console.log("3. Go to test run '"+testRunDao.displayName+"'\n");
                await this.getTestRunAPI(testRunId, status, startTime);
            }
        }
        catch(err:any) {
            if(!err.message)
                err.message = "Error in running the test";
            throw new Error(err.message);
        }
    }

    async getTestRunAPI(testRunId:string, testStatus:string, startTime : Date) 
    {   
        let urlSuffix = "test-runs/"+testRunId+"?api-version=" + ApiVersionConstants.latestVersion;
        urlSuffix = this.baseURL+urlSuffix;
        while(!Util.isTerminalTestStatus(testStatus)) 
        {
            let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.get);
            let testRunResult = await FetchUtil.httpClientRetries(urlSuffix,header,'get',3,"");
            let testRunObj: TestRunModel = await Util.getResultObj(testRunResult);
            if (testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201) {
                console.log(testRunObj ? testRunObj : Util.ErrorCorrection(testRunResult));
                throw new Error("Error in getting the test run");
            }
            testStatus = testRunObj.status;
            if(Util.isTerminalTestStatus(testStatus)) {
                let vusers = null;
                let count = 0;
                let reportsAvailable = false;
                console.log("Test run completed. Polling for statistics and dashboard report to populate.");
                // Polling for max 3 min for statistics and pass fail criteria to populate
                while((!reportsAvailable || isNullOrUndefined(vusers)) && count < 18){
                    await Util.sleep(10000);
                    let header = await this.authContext.getDataPlaneHeader(CallTypeForDP.get);
                    let testRunResult = await FetchUtil.httpClientRetries(urlSuffix,header,'get',3,"");
                    testRunObj = await Util.getResultObj(testRunResult);
                    if(testRunObj == null){
                        throw new Error(Util.ErrorCorrection(testRunResult));
                    }
                    if(testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201){
                        console.log(testRunResult ? testRunResult : Util.ErrorCorrection(testRunResult));
                        throw new Error("Error in getting the test run");
                    }
                    vusers = testRunObj.virtualUsers;
                    count++;
                    let testReport = Util.getReportFolder(testRunObj.testArtifacts);
                    if(testReport) {
                        reportsAvailable = true;
                    }
                }
                if(testRunObj && testRunObj.startDateTime){
                    startTime = new Date(testRunObj.startDateTime);
                }
                let endTime = new Date();
                if(testRunObj && testRunObj.endDateTime){
                    endTime = new Date(testRunObj.endDateTime);
                }
                Util.printTestDuration(testRunObj);
                if(!isNullOrUndefined(testRunObj.passFailCriteria) && !isNullOrUndefined(testRunObj.passFailCriteria.passFailMetrics))
                    Util.printCriteria(testRunObj.passFailCriteria.passFailMetrics)
                if(testRunObj.testRunStatistics != null && testRunObj.testRunStatistics != undefined)
                    Util.printClientMetrics(testRunObj.testRunStatistics);
    
                let testResultUrl = Util.getResultFolder(testRunObj.testArtifacts);
                if(testResultUrl != null) {
                    const response = await FetchUtil.httpClientRetries(testResultUrl,{},'get',3,"");
                    if (response.message.statusCode != 200) {
                        let respObj:any = await Util.getResultObj(response);
                        console.log(respObj ? respObj : Util.ErrorCorrection(response));
                        throw new Error("Error in fetching results ");
                    }
                    else {
                        await FileUtils.uploadFileToResultsFolder(response, resultZipFileName);
                    }
                }
                let testReportUrl = Util.getReportFolder(testRunObj.testArtifacts);
                if(testReportUrl != null) {
                    const response = await FetchUtil.httpClientRetries(testReportUrl,{},'get',3,"");
                    if (response.message.statusCode != 200) {
                        let respObj:any = await Util.getResultObj(response);
                        console.log(respObj ? respObj : Util.ErrorCorrection(response));
                        throw new Error("Error in fetching report ");
                    }
                    else {
                        await FileUtils.uploadFileToResultsFolder(response, reportZipFileName);
                    }
                }
    
                if(!isNull(testRunObj.testResult) && Util.isStatusFailed(testRunObj.testResult)) {
                    core.setFailed("TestResult: "+ testRunObj.testResult);
                    return;
                }
                if(!isNull(testRunObj.status) && Util.isStatusFailed(testRunObj.status)) {
                    console.log("Please go to the Portal for more error details: "+ testRunObj.portalUrl);
                    core.setFailed("TestStatus: "+ testRunObj.status);
                    return;
                }
                return;
            }
            else 
            {
                if(!Util.isTerminalTestStatus(testStatus))
                {
                    if(testStatus === "DEPROVISIONING" || testStatus === "DEPROVISIONED" || testStatus != "EXECUTED" )
                        await Util.sleep(5000);
                    else
                        await Util.sleep(20000);
                }
            }
        }
    }
}