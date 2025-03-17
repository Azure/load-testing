import { isNullOrUndefined } from "util";
import { APIService } from "../services/APIService";
import { AppComponents, FileType, ExistingParams, FileInfo, TestModel, TestRunModel, FileStatus, ServerMetricConfig } from "../models/PayloadModels";
import { LoadtestConfigUtil } from "../Utils/LoadtestConfigUtil";
import { getAllFileNamesTobeDeleted, validateAndGetOutPutVarName, getPayloadForAppcomponents, getPayloadForTest, validateAndGetRunTimeParamsForTestRun, getTestRunPayload, getPayloadForServerMetricsConfig, validateAndSetOverrideParams, addExistingTestParameters, addExistingAppComponentParameters } from "../Utils/CreateAndRunUtils";
import { FetchCallType, OutputVariableInterface, OutPutVariablesConstants, PostTaskParameters, reportZipFileName, resultZipFileName, RunTimeParams } from "../models/UtilModels";
import { TestKind } from "../models/TestKind";
import * as Util from "../Utils/CommonUtils";
import * as CoreUtils from '../Utils/CoreUtils';
import * as FileUtils from '../Utils/FileUtils';
import * as FetchUtil from '../Utils/FetchUtils';
import { LoadtestConfig } from "../models/LoadtestConfig";

export class CreateAndRunTest {

    private apiService: APIService;
    private loadTestConfig: LoadtestConfig = {} as LoadtestConfig;
    private isCreateTest: boolean = true;
    private existingTestObj: TestModel | null = null;
    private existingParams: ExistingParams = { secrets: {}, env: {}, passFailCriteria: {}, passFailServerMetrics: {}, appComponents: new Map() };

    constructor(apiService: APIService) {
        this.apiService = apiService;
    }

    public async createAndRunTest() {
        await this.initialize();
        let testPayload = await this.getTestPayload();

        if(this.isCreateTest) {
            console.log("Creating a new load test " + this.loadTestConfig.testId);
        }

        let createdTestObj = await this.apiService.createTestAPI(testPayload);
        this.isCreateTest ? console.log(`Created test with id ${createdTestObj.testId}`) : console.log("Test '"+ createdTestObj.testId +"' already exists");
        let testFiles = createdTestObj.inputArtifacts;
    
        let filesToDelete = testFiles ? getAllFileNamesTobeDeleted(this.loadTestConfig, testFiles) : [];
        if(filesToDelete.length > 0){
            console.log(`Deleting ${filesToDelete.length} existing test file(s) which is(are) not in the configuration yaml file.`);
        }
        for(const file of filesToDelete){
            await this.apiService.deleteFileAPI(file);
        }
    
        await this.uploadAllTestFiles(this.loadTestConfig, this.apiService);
        let validatedTest = await this.awaitTerminationForFileValidation(this.apiService) as TestModel;
        this.checkForValidationsOfTest(validatedTest);
    
        let appComponentsPayload = await this.getAppComponentsPayload();
        let appComponentsResp = await this.apiService.patchAppComponents(appComponentsPayload);
        appComponentsResp && console.log("Updated app components successfully");
    
        let serverMetricsConfigPayload = await this.getServerMetricsConfigPayload();
        await this.apiService.patchServerMetricsConfig(serverMetricsConfigPayload);
        serverMetricsConfigPayload && console.log("Updated server metrics successfully");
    
        console.log("Creating and running a testRun for the test");
        let testRunPayload : TestRunModel = await this.getTestRunPayload();
        let testRunResult = await this.apiService.createTestRun(testRunPayload);
        this.printPortalUrl(testRunResult);
    
        CoreUtils.exportVariable(PostTaskParameters.runId, testRunResult.testRunId);
    
        await this.awaitTerminationForTestRun(testRunResult.testRunId, this.apiService);
        testRunResult = await this.awaitResultsPopulation(testRunResult.testRunId, this.apiService) ?? testRunResult;
        CoreUtils.exportVariable(PostTaskParameters.isRunCompleted, 'true');
    
        this.printMetrics(testRunResult);
        await this.uploadResultsToPipeline(testRunResult);
        this.setTaskResults(testRunResult);
        this.setOutputVariable(testRunResult);
    }

    public async initialize() {
        this.loadTestConfig = LoadtestConfigUtil.parseLoadtestConfigFile();
        validateAndSetOverrideParams(this.loadTestConfig);
        this.apiService.setTestId(this.loadTestConfig.testId!);

        this.existingTestObj = await this.apiService.getTestAPI(true);

        if(this.existingTestObj){
            this.isCreateTest = false;
        }
        else{
            this.isCreateTest = true;
        }
    }

    // Marked public for testing
    public async getTestPayload(): Promise<TestModel> {
        if(!this.isCreateTest){
            this.existingTestObj && addExistingTestParameters(this.existingTestObj, this.existingParams);
        }

        return getPayloadForTest(this.loadTestConfig, this.existingParams);
    }

    public async getAppComponentsPayload(): Promise<AppComponents> {
        if(!this.isCreateTest) {
            let appComponentsObj: AppComponents | null = await this.apiService.getAppComponents();
            addExistingAppComponentParameters(appComponentsObj, this.existingParams);
        }

        return getPayloadForAppcomponents(this.loadTestConfig, this.existingParams)
    }

    public async getServerMetricsConfigPayload(): Promise<ServerMetricConfig> {
        let existingServerMetricsConfig = null;

        if(!this.isCreateTest) {
            existingServerMetricsConfig = await this.apiService.getServerMetricsConfig();
        }

        return getPayloadForServerMetricsConfig(existingServerMetricsConfig, this.loadTestConfig);
    }

    public async getTestRunPayload(): Promise<TestRunModel> {
        let runTimeParamsofTestRun : RunTimeParams = validateAndGetRunTimeParamsForTestRun(this.loadTestConfig.testId!);
        return getTestRunPayload(runTimeParamsofTestRun);
    }

    /*
    * This function will wait for the validation of files to complete
    */
    public async awaitTerminationForFileValidation(apiService : APIService) : Promise<TestModel | null> {
        let minutesToAdd=10;
        let startTime = new Date();
        let maxAllowedTime = new Date(startTime.getTime() + minutesToAdd*60000);
        let validationStatus : string = FileStatus.VALIDATION_INITIATED;
        let testObj: TestModel | null = null;
        let retry = 5;
        while(maxAllowedTime>(new Date()) && !Util.isTerminalFileStatus(validationStatus)){
            await Util.sleep(5000);
            try{
                testObj = await apiService.getTestAPI();
                let inputScriptFileInfo: FileInfo | undefined
                testObj && (inputScriptFileInfo = testObj.kind == TestKind.URL ? testObj.inputArtifacts?.urlTestConfigFileInfo : testObj.inputArtifacts?.testScriptFileInfo);
                validationStatus = inputScriptFileInfo?.validationStatus ?? validationStatus;
            }
            catch(e) {
                retry--;
                if(retry == 0){
                    throw new Error("Unable to validate the test plan. Please retry. Failed with error :" + e);
                }
            }
        }
        return testObj;
    }

    /*
    * This function will wait for the test run to complete
    */
    public async awaitTerminationForTestRun(id: string, apiService : APIService) : Promise<TestRunModel | null> {
        let testRunStatus = "ACCEPTED";
        let testRunObj: TestRunModel | null = null;
        while(!Util.isTerminalTestStatus(testRunStatus)) {
            if(testRunStatus === "DEPROVISIONING" || testRunStatus === "DEPROVISIONED" || testRunStatus == "EXECUTED" )
                await Util.sleep(5000);
            else
                await Util.sleep(20000);

            testRunObj = await apiService.getTestRunAPI(id);
            testRunStatus = testRunObj.status ?? testRunStatus;
        }
        return testRunObj;
    }

    // Marked public for testing
    public async awaitResultsPopulation(testRunId: string, apiService: APIService) : Promise<TestRunModel | null> {
        let vusers = null;
        let count = 0;
        let reportsAvailable = false;
        let testRunObj : TestRunModel | null = null;
        console.log("Test run completed. Polling for statistics and dashboard report to populate.");
        // Polling for max 5 min for statistics and pass fail criteria to populate
        while((!reportsAvailable || isNullOrUndefined(vusers)) && count < 30){
            await Util.sleep(10000);
            testRunObj = await apiService.getTestRunAPI(testRunId);
            vusers = testRunObj.virtualUsers;
            count++;
            let testReport = Util.getReportFolder(testRunObj.testArtifacts);
            if(testReport) {
                reportsAvailable = true;
            }
        }
        return testRunObj;
    }

    private async uploadAllTestFiles(loadTestConfig: LoadtestConfig, apiService: APIService) : Promise<void> {
        let configFiles = loadTestConfig.configurationFiles;
        if(configFiles.length > 0) {
            console.log("Uploading the configuration files");
            await this.uploadFiles(configFiles, apiService, FileType.ADDITIONAL_ARTIFACTS);
            console.log(`Uploaded ${configFiles.length} configuration file(s) for the test successfully.`);
        }
    
        let zipFiles = loadTestConfig.zipArtifacts;
        if(zipFiles.length > 0) {
            console.log("Uploading the zip artifacts");
            await this.uploadFiles(zipFiles, apiService, FileType.ZIPPED_ARTIFACTS);
            console.log(`Uploaded ${zipFiles.length} zip artifact(s) for the test successfully.`);
        }
    
        let propertyFile = loadTestConfig.propertyFile;
        if(propertyFile != undefined && propertyFile!= '') {
            console.log("Uploading the user properties file");
            await apiService.uploadFile(propertyFile, FileType.USER_PROPERTIES);
            console.log(`Uploaded user properties file for the test successfully.`);
        }
    
        await this.uploadTestScriptFile(loadTestConfig, apiService);
    }

    private async uploadFiles(configFiles: string[], apiService: APIService, fileType: FileType) : Promise<void> {
        if(configFiles.length > 0) {
            for(let filepath of configFiles){
                await apiService.uploadFile(filepath, fileType);
            };
        }
    }

    private async uploadTestScriptFile(loadTestConfig: LoadtestConfig, apiService: APIService) : Promise<void> {
        let testScriptFile = loadTestConfig.testPlan;
        let fileType = FileType.TEST_SCRIPT;
        if(loadTestConfig.kind == TestKind.URL){
            fileType = FileType.URL_TEST_CONFIG;
        }
        console.log("Uploading the test script file");
        await apiService.uploadFile(testScriptFile, fileType);
        console.log(`Uploaded test script file for the test successfully.`);
    }

    private printPortalUrl(testRunObj: TestRunModel) {
        console.log("Creating and running a testRun for the test");
        let portalUrl = testRunObj.portalUrl;
        let status = testRunObj.status;
        if(status) {
            console.log("View the load test run in progress at: "+ portalUrl)
        }
    }

    private checkForValidationsOfTest(testObj: TestModel) : void {
        let validationStatus = testObj.inputArtifacts?.testScriptFileInfo?.validationStatus ?? FileStatus.VALIDATION_INITIATED;
        console.log("Validation status of the test plan: "+ validationStatus);
    
        if(Util.isTerminalFileStatusSucceeded(validationStatus)) {
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
        }
        else if(!Util.isTerminalFileStatus(validationStatus)){
            throw new Error("TestPlan validation timeout. Please try again.")
        }
        else{
            throw new Error("TestPlan validation Failed.");
        }
    }

    private printMetrics(testRunObj: TestRunModel) : void {
        Util.printTestDuration(testRunObj);
        if(!isNullOrUndefined(testRunObj.passFailCriteria) && !isNullOrUndefined(testRunObj.passFailCriteria.passFailMetrics))
            Util.printCriteria(testRunObj.passFailCriteria.passFailMetrics)
        if(testRunObj.testRunStatistics != null && testRunObj.testRunStatistics != undefined)
            Util.printClientMetrics(testRunObj.testRunStatistics);
    }
    
    private async uploadResultsToPipeline(testRunObj: TestRunModel) : Promise<void> {
        let testResultUrl = Util.getResultFolder(testRunObj.testArtifacts);
        if(testResultUrl != null) {
            const response = await FetchUtil.httpClientRetries(testResultUrl,{},FetchCallType.get,3,"");
            if (response.message.statusCode != 200) {
                let respObj:any = await Util.getResultObj(response);
                console.log(respObj ? respObj : Util.errorCorrection(response));
                throw new Error("Error in fetching results ");
            }
            else {
                await FileUtils.uploadFileToResultsFolder(response, resultZipFileName);
            }
        }
        let testReportUrl = Util.getReportFolder(testRunObj.testArtifacts);
        if(testReportUrl != null) {
            const response = await FetchUtil.httpClientRetries(testReportUrl,{},FetchCallType.get,3,"");
            if (response.message.statusCode != 200) {
                let respObj:any = await Util.getResultObj(response);
                console.log(respObj ? respObj : Util.errorCorrection(response));
                throw new Error("Error in fetching report ");
            }
            else {
                await FileUtils.uploadFileToResultsFolder(response, reportZipFileName);
            }
        }
    }
    
    private setTaskResults(testRunObj: TestRunModel) : void {
        if(!isNullOrUndefined(testRunObj.testResult) && Util.isStatusFailed(testRunObj.testResult)) {
            CoreUtils.setFailed("TestResult: " + testRunObj.testResult);
        }
        if(!isNullOrUndefined(testRunObj.status) && Util.isStatusFailed(testRunObj.status)) {
            console.log("Please go to the Portal for more error details: "+ testRunObj.portalUrl);
            CoreUtils.setFailed("TestStatus: " + testRunObj.status);
        }
    }
    
    private setOutputVariable(testRunObj: TestRunModel) {
        let outputVarName = validateAndGetOutPutVarName();
        let outputVar: OutputVariableInterface = {
            testRunId: testRunObj.testRunId
        }
    
        CoreUtils.setOutput(`${outputVarName}.${OutPutVariablesConstants.testRunId}`, outputVar.testRunId);
    }
}