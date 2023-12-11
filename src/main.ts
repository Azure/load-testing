import * as core from '@actions/core'
import httpc = require('typed-rest-client/HttpClient');
import * as map from "./mappers"
import * as util from './util';
import * as fs from 'fs';
import { isNullOrUndefined } from 'util';
import {TestKind} from "./mappers";

const resultFolder = 'loadTest';
let baseURL = '';
const httpClient: httpc.HttpClient = new httpc.HttpClient('MALT-GHACTION');
let testId = '';
let existingCriteria: { [name: string]: map.criteriaObj | null } = {};
let existingParams: { [name: string]: map.paramObj|null } = {};
let existingEnv: { [name: string]: string } = {};
enum FileType{
    JMX_FILE = 'JMX_FILE',
    USER_PROPERTIES = 'USER_PROPERTIES',
    ADDITIONAL_ARTIFACTS = 'ADDITIONAL_ARTIFACTS',
    ZIPPED_ARTIFACTS = "ZIPPED_ARTIFACTS",
    URL_TEST_CONFIG = "URL_TEST_CONFIG"
}
async function run() {
    try {  
        await map.getInputParams();
        await getLoadTestResource();
        testId = map.getTestId();
        await getTestAPI(false);
        if (fs.existsSync(resultFolder)){
            util.deleteFile(resultFolder);
        }
        fs.mkdirSync(resultFolder);
        await createTestAPI();
    }
    catch (err:any) {
        core.setFailed(err.message);
    }
}
async function getTestAPI(validate:boolean) {
    var urlSuffix = "tests/"+testId+"?api-version="+util.apiConstants.tm2023Version;
    urlSuffix = baseURL+urlSuffix;
    let header = await map.getTestHeader();
    let testResult = await util.httpClientRetries(urlSuffix,header,'get',3,"");
    if(testResult.message.statusCode == 401 || testResult.message.statusCode == 403){
        var message = "Service Principal does not have sufficient permissions. Please assign " 
        +"the Load Test Contributor role to the service principal. Follow the steps listed at "
        +"https://docs.microsoft.com/azure/load-testing/tutorial-cicd-github-actions#configure-the-github-actions-workflow-to-run-a-load-test ";
        throw new Error(message);
    }
    if(testResult.message.statusCode != 200 && testResult.message.statusCode != 201 && testResult.message.statusCode != 404){
        let testObj:any=await util.getResultObj(testResult);
        console.log(testObj ? testObj : util.ErrorCorrection(testResult));
        throw new Error("Error in getting the test.");
    }
    if(testResult.message.statusCode == 200) {
        let testObj:any=await util.getResultObj(testResult);
        if(testObj == null){
            throw new Error(util.ErrorCorrection(testResult));
        }
        if (testObj.kind == null){
            testObj.kind = testObj.testType;
        }
        if (testObj.inputArtifacts.urlTestConfigFileInfo == null)
            testObj.inputArtifacts.urlTestConfigFileInfo = testObj.inputArtifacts.urlTestsConfigFileInfo;
        var inputScriptFileInfo = testObj.kind == TestKind.URL ? testObj.inputArtifacts.urlTestConfigFileInfo :testObj.inputArtifacts.testScriptFileInfo;
        if(validate){
            return inputScriptFileInfo.validationStatus;
        }
        else
        {
            if(!isNullOrUndefined(testObj.passFailCriteria) && !isNullOrUndefined(testObj.passFailCriteria.passFailMetrics))
                existingCriteria = testObj.passFailCriteria.passFailMetrics;
            if(testObj.secrets != null)
                existingParams = testObj.secrets;
            if(testObj.environmentVariables != null)
                existingEnv = testObj.environmentVariables;
        }
    }   
}
async function deleteFileAPI(filename:string) {
    var urlSuffix = "tests/"+testId+"/files/"+filename+"?api-version="+util.apiConstants.tm2023Version;
    urlSuffix = baseURL+urlSuffix;
    let header = await map.getTestHeader();
    let delFileResult = await util.httpClientRetries(urlSuffix,header,'del',3,"");
    if(delFileResult.message.statusCode != 204){
        let delFileObj:any=await util.getResultObj(delFileResult);
        let Message: string = delFileObj ? delFileObj.message : util.ErrorCorrection(delFileResult);
        throw new Error(Message);
    }
}
async function createTestAPI() {
    var urlSuffix = "tests/"+testId+"?api-version="+util.apiConstants.tm2023Version;
    urlSuffix = baseURL+urlSuffix;
    var createData = map.createTestData();
    let header = await map.createTestHeader();
    let createTestresult = await util.httpClientRetries(urlSuffix,header,'patch',3,JSON.stringify(createData));
    if(createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
        let testRunObj:any=await util.getResultObj(createTestresult);
        console.log(testRunObj ? testRunObj : util.ErrorCorrection(createTestresult));
        throw new Error("Error in creating test: " + testId);
    }
    if(createTestresult.message.statusCode == 201) {
        console.log("Creating a new load test '"+testId+"' ");
        console.log("Successfully created load test "+testId);
    }
    else{
        console.log("Test '"+ testId +"' already exists");
        // test script will anyway be updated by the GH-actions in later steps, this will be error if the test script is not present in the test.
        // this will be error in the url tests when the quick test is getting updated to the url test. so removing this.
        let testObj:any=await util.getResultObj(createTestresult);
        var testFiles = testObj.inputArtifacts;
        if(testFiles.userPropUrl != null && map.getPropertyFile() != null){
            await deleteFileAPI(testFiles.userPropFileInfo.filename);
        }
        if(testFiles.additionalFileInfo != null){
            // delete existing files which are not present in yaml, the files which are in yaml will anyway be uploaded again.
            let existingFiles : string[] = [];
            let file : any;
            for(file of testFiles.additionalFileInfo){
                existingFiles.push(file.fileName);
            }
            for(file of map.getConfigFiles()){
                let indexOfFile = existingFiles.indexOf(file)
                if(indexOfFile != -1){
                    existingFiles.splice(indexOfFile, 1);
                }
            }
            for(file of map.getZipFiles()){
                let indexOfFile = existingFiles.indexOf(file)
                if(indexOfFile != -1){
                    existingFiles.splice(indexOfFile, 1);
                }
            }
            if(existingFiles.length > 0){
                console.log(`Deleting the ${existingFiles.length} existing test files which are not in the configuration yaml file.`);
            }
            for(file of existingFiles){
                await deleteFileAPI(file);
            }
        }
    }

    await uploadConfigFile()
}

async function uploadTestPlan() 
{
    let retry = 5;
    let filepath = map.getTestFile();
    let filename = map.getFileName(filepath);
    var urlSuffix = "tests/"+testId+"/files/"+filename+"?api-version="+util.apiConstants.tm2023Version;
    if(map.getTestKind() == TestKind.URL){
        urlSuffix = urlSuffix + ("&fileType="+FileType.URL_TEST_CONFIG);
    }
    urlSuffix = baseURL + urlSuffix;
    let headers = await map.UploadAndValidateHeader();
    let uploadresult = await util.httpClientRetries(urlSuffix,headers,'put',3,filepath,true);
    if(uploadresult.message.statusCode != 201){
        let uploadObj:any = await util.getResultObj(uploadresult);
        console.log(uploadObj ? uploadObj : util.ErrorCorrection(uploadresult));
        throw new Error("Error in uploading TestPlan for the created test");
    }
    else {
        console.log("Uploaded test plan for the test");
        var minutesToAdd=10;
        var startTime = new Date();
        var maxAllowedTime = new Date(startTime.getTime() + minutesToAdd*60000);
        var validationStatus = "VALIDATION_INITIATED";
        while(maxAllowedTime>(new Date()) && (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")) {
            try{
                validationStatus = await getTestAPI(true);
            }
            catch(e) {
                retry--;
                if(retry == 0){
                    throw new Error("Unable to validate the test plan. Please retry.");
                }
            }
            await util.sleep(5000);
        }
        if(validationStatus == null || validationStatus == "VALIDATION_SUCCESS" ){
            console.log(`Validated test plan for the test successfully.`);
            await createTestRun();
        }
        else if(validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")
            throw new Error("TestPlan validation timeout. Please try again.")
        else
            throw new Error("TestPlan validation Failed.");
    }
}
async function uploadConfigFile() 
{
    let configFiles = map.getConfigFiles();
    if(configFiles != undefined && configFiles.length > 0) {
        for (let filepath of configFiles) {
            let filename = map.getFileName(filepath);
            var urlSuffix = "tests/"+testId+"/files/"+filename+"?api-version="+util.apiConstants.tm2023Version;
            urlSuffix = baseURL+urlSuffix;
            let headers = await map.UploadAndValidateHeader();
            let uploadresult = await util.httpClientRetries(urlSuffix,headers,'put',3,filepath, true);
            if(uploadresult.message.statusCode != 201){
                let uploadObj:any = await util.getResultObj(uploadresult);
                console.log(uploadObj ? uploadObj : util.ErrorCorrection(uploadresult));
                throw new Error("Error in uploading config file for the created test");
            }
        }
        console.log(`Uploaded ${configFiles.length} configuration file(s) for the test successfully.`);
    }
    await uploadZipArtifacts();
}
async function uploadZipArtifacts()
{
    let zipFiles = map.getZipFiles();
    if(zipFiles != undefined && zipFiles.length > 0) {
        console.log("Uploading and validating the zip artifacts");
        for (let filepath of zipFiles) {
            let filename = map.getFileName(filepath);
            var urlSuffix = "tests/"+testId+"/files/"+filename+"?api-version="+util.apiConstants.tm2023Version+"&fileType="+FileType.ZIPPED_ARTIFACTS;
            urlSuffix = baseURL+urlSuffix;
            let headers = await map.UploadAndValidateHeader();
            let uploadresult = await util.httpClientRetries(urlSuffix,headers,'put',3,filepath, true);
            if(uploadresult.message.statusCode != 201){
                let uploadObj:any = await util.getResultObj(uploadresult);
                console.log(uploadObj ? uploadObj : util.ErrorCorrection(uploadresult));
                throw new Error("Error in uploading config file for the created test");
            }
        }
        var minutesToAdd=5;
        let startTime = new Date();
        var maxAllowedTime = new Date(startTime.getTime() + minutesToAdd*60000);
        let flagValidationPending = true;
        while(maxAllowedTime>(new Date()) && flagValidationPending) {
            var urlSuffix = "tests/"+testId+"?api-version="+util.apiConstants.tm2023Version;
            urlSuffix = baseURL+urlSuffix;
            let header = await map.getTestHeader();
            let testResult = await util.httpClientRetries(urlSuffix,header,'get',3,"");
            let testObj = await util.getResultObj(testResult);
            flagValidationPending = false;
            if (testObj && testObj.inputArtifacts && testObj.inputArtifacts.additionalFileInfo) {
                for(const file of testObj.inputArtifacts.additionalFileInfo){
                    if (file.fileType == FileType.ZIPPED_ARTIFACTS && (file.validationStatus != "VALIDATION_SUCCESS" && file.validationStatus != "VALIDATION_FAILURE")) {
                        flagValidationPending = true;
                        break;
                    }
                }
            }
            else {
                break;
            }
            await util.sleep(3000);
        }
        console.log(`Uploaded and validated ${zipFiles.length} zip artifact(s) for the test successfully.`);
    }
    var statuscode = await uploadPropertyFile();
    if(statuscode== 201){
        await uploadTestPlan();
    }
}
async function uploadPropertyFile() 
{
    let propertyFile = map.getPropertyFile();
    if(propertyFile != undefined) {
        let filename = map.getFileName(propertyFile);
        var urlSuffix = "tests/"+testId+"/files/"+filename+"?api-version="+util.apiConstants.tm2023Version+"&fileType="+FileType.USER_PROPERTIES;
        urlSuffix = baseURL + urlSuffix;
        let headers = await map.UploadAndValidateHeader();
        let uploadresult = await util.httpClientRetries(urlSuffix,headers,'put',3,propertyFile);
        if(uploadresult.message.statusCode != 201){
            let uploadObj:any = await util.getResultObj(uploadresult);
            console.log(uploadObj ? uploadObj : util.ErrorCorrection(uploadresult));
            throw new Error("Error in uploading TestPlan for the created test");
        }
        console.log(`Uploaded user properties file for the test successfully.`);
    }
    return 201;
}

async function createTestRun() {
    const tenantId = map.getTenantId();
    const testRunId = util.getUniqueId();
    var urlSuffix = "test-runs/"+testRunId+"?tenantId="+tenantId+"&api-version="+util.apiConstants.tm2023Version;
    urlSuffix = baseURL+urlSuffix;
    const ltres: string = core.getInput('loadTestResource');
    const runDisplayName: string = core.getInput('loadTestRunName');
    const runDescription: string = core.getInput('loadTestRunDescription');
    const subName = await map.getSubName();
    try {
        var startData = map.startTestData(testRunId, runDisplayName, runDescription);
        console.log("Creating and running a testRun for the test");
        let header = await map.createTestHeader();
        let startTestresult = await util.httpClientRetries(urlSuffix,header,'patch',3,JSON.stringify(startData));
        let testRunDao:any=await util.getResultObj(startTestresult);
        if(startTestresult.message.statusCode != 200 && startTestresult.message.statusCode != 201) {
            console.log(testRunDao ? testRunDao : util.ErrorCorrection(startTestresult));
            throw new Error("Error in running the test");
        }   
        let startTime = new Date();
        let testRunName = testRunDao.displayName;
        let status = testRunDao.status;
        if(status == "ACCEPTED") {
            console.log("\nView the load test run in Azure portal by following the steps:")
            console.log("1. Go to your Azure Load Testing resource '"+ltres+"' in subscription '"+subName+"'")
            console.log("2. On the Tests page, go to test '"+testId+"'")
            console.log("3. Go to test run '"+testRunName+"'\n");
            await getTestRunAPI(testRunId, status, startTime);
        }
    }
    catch(err:any) {
        if(!err.message)
            err.message = "Error in running the test";
        throw new Error(err.message);
    }
}
async function getTestRunAPI(testRunId:string, testStatus:string, startTime:Date) 
{   
    var urlSuffix = "test-runs/"+testRunId+"?api-version="+util.apiConstants.tm2023Version;
    urlSuffix = baseURL+urlSuffix;
    while(!util.isTerminalTestStatus(testStatus)) 
    {
        let header = await map.getTestRunHeader();
        let testRunResult = await util.httpClientRetries(urlSuffix,header,'get',3,"");
        let testRunObj:any = await util.getResultObj(testRunResult);
        if(testRunObj == null){
            throw new Error(util.ErrorCorrection(testRunResult));
        }
        testStatus = testRunObj.status;
        if(util.isTerminalTestStatus(testStatus)) {
            let vusers = null;
            let count = 0;
            // Polling for max 3 min for statistics and pass fail criteria to populate
            while(isNullOrUndefined(vusers) && count < 18){
                await util.sleep(10000);
                let header = await map.getTestRunHeader();
                let testRunResult = await util.httpClientRetries(urlSuffix,header,'get',3,"");
                testRunObj = await util.getResultObj(testRunResult);
                if(testRunObj == null){
                    throw new Error(util.ErrorCorrection(testRunResult));
                }
                if(testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201){
                    let testRunObj:any = await util.getResultObj(testRunResult);
                    console.log(testRunObj ? testRunObj : util.ErrorCorrection(testRunResult));
                    throw new Error("Error in getting the test-run");
                }
                vusers = testRunObj.virtualUsers;
                count++;
            }
            if(testRunObj && testRunObj.startDateTime){
                startTime = new Date(testRunObj.startDateTime);
            }
            let endTime = new Date();
            if(testRunObj && testRunObj.endDateTime){
                endTime = new Date(testRunObj.endDateTime);
            }
            util.printTestDuration(testRunObj.virtualUsers, startTime, endTime ,testStatus);
            if(!isNullOrUndefined(testRunObj.passFailCriteria) && !isNullOrUndefined(testRunObj.passFailCriteria.passFailMetrics))
                util.printCriteria(testRunObj.passFailCriteria.passFailMetrics)
            if(testRunObj.testRunStatistics != null)
                util.printClientMetrics(testRunObj.testRunStatistics);
            var testResultUrl = util.getResultFolder(testRunObj.testArtifacts);
            if(testResultUrl != null) {
                const response = await util.httpClientRetries(testResultUrl,{'content-type' : 'application/merge-patch+json'},'get',3,"");
                if (response.message.statusCode != 200) {
                    let respObj:any = await util.getResultObj(response);
                    console.log(respObj ? respObj : util.ErrorCorrection(response));
                    throw new Error("Error in fetching results ");
                }
                else {
                    await util.getResultsFile(response);
                }
            }
            if(testRunObj.status === "FAILED" || testRunObj.status === "CANCELLED") {
                core.setFailed("TestStatus: "+ testRunObj.status);
                return;
            }
            if(testRunObj.testResult === "FAILED" || testRunObj.testResult === "CANCELLED") {
                core.setFailed("TestResult: "+ testRunObj.testResult);
                return;
            }
            return;
        }
        else 
        {
            if(!util.isTerminalTestStatus(testStatus))
            {
                if(testStatus === "DEPROVISIONING" || testStatus === "DEPROVISIONED" || testStatus != "EXECUTED" )
                    await util.sleep(5000);
                else
                    await util.sleep(20000);
            }
        }
    }
}
async function getLoadTestResource()
{
    let env = "prod";
    let id = map.getResourceId();

    let armEndpoint = "https://management.azure.com"+id+"?api-version="+util.apiConstants.cp2022Version;
    if(env == "canary") {
        armEndpoint = "https://eastus2euap.management.azure.com"+id+"?api-version="+util.apiConstants.cp2022Version;
    }
    if(env == "dogfood") {
        armEndpoint = "https://api-dogfood.resources.windows-int.net"+id+"?api-version="+util.apiConstants.cp2022Version;
    }
    var header = map.dataPlaneHeader();
    let response = await util.httpClientRetries(armEndpoint,header,'get',3,"");
    var resource_name: string = core.getInput('loadTestResource');
    if(response.message.statusCode == 404) {
        var message = "The Azure Load Testing resource "+ resource_name +" does not exist. Please provide an existing resource.";
        throw new Error(message);
    }
    let respObj:any = await util.getResultObj(response);
    if(response.message.statusCode != 200){
        console.log(respObj ? respObj : util.ErrorCorrection(response));
        throw new Error("Error fetching resource " + resource_name);
    }
    let dataPlaneUrl = respObj.properties.dataPlaneURI;
    baseURL = 'https://'+dataPlaneUrl+'/';
}
export function getExistingCriteria()
{
    return existingCriteria;
}
export function getExistingParams()
{
    return existingParams;
}
export function getExistingEnv()
{
    return existingEnv;
}
run();