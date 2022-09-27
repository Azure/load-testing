import * as core from '@actions/core'
import httpc = require('typed-rest-client/HttpClient');
import * as map from "./mappers"
import * as util from './util';
import * as fs from 'fs';

const resultFolder = 'loadTest';
let baseURL = '';
const httpClient: httpc.HttpClient = new httpc.HttpClient('MALT-GHACTION');
let testName = '';
let existingCriteria: { [name: string]: map.criteriaObj|null } = {};
let existingParams: { [name: string]: map.paramObj|null } = {};
let existingEnv: { [name: string]: string } = {};

async function run() {
    try {  
        await map.getInputParams();
        await getLoadTestResource();
        testName = map.getTestName();
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
    var urlSuffix = "loadtests/"+testName+"?api-version=2022-06-01-preview";
    urlSuffix = baseURL+urlSuffix;
    let header = await map.getTestHeader();
    let testResult = await httpClient.get(urlSuffix, header); 
    if(testResult.message.statusCode == 401 || testResult.message.statusCode == 403){
        var message = "Service Principal does not have sufficient permissions. Please assign " 
        +"the Load Test Contributor role to the service principal. Follow the steps listed at "
        +"https://docs.microsoft.com/azure/load-testing/tutorial-cicd-github-actions#configure-the-github-actions-workflow-to-run-a-load-test ";
        throw new Error(message);
    }
    if(testResult.message.statusCode == 200) {
        let testResp: string = await testResult.readBody(); 
        let testObj:any = JSON.parse(testResp);
        var testFile = testObj.inputArtifacts;  
        if(validate)
            return testFile.testScriptUrl.validationStatus;
        else
        {
            if(testObj.passFailCriteria != null && testObj.passFailCriteria.passFailMetrics)
                existingCriteria = testObj.passFailCriteria.passFailMetrics;
            if(testObj.secrets != null)
                existingParams = testObj.secrets;
            if(testObj.environmentVariables != null)
                existingEnv = testObj.environmentVariables;
            if(testFile.testScriptUrl != null)
                await deleteFileAPI(testFile.testScriptUrl.fileId)
            if(testFile.userPropUrl != null)
                await deleteFileAPI(testFile.userPropUrl.fileId);
        }
    }   
}
async function deleteFileAPI(fileId:string) {
    var urlSuffix = "loadtests/"+testName+"/files/"+fileId+"?api-version=2022-06-01-preview";
    urlSuffix = baseURL+urlSuffix;
    let header = await map.getTestHeader();
    let delFileResult = await httpClient.del(urlSuffix, header); 
    if(delFileResult.message.statusCode != 204){
        let delFileResp: string = await delFileResult.readBody(); 
        let delFileObj:any = JSON.parse(delFileResp);
        throw new Error(delFileObj.message);
    }
}
async function createTestAPI() {
    var urlSuffix = "loadtests/"+testName+"?api-version=2022-06-01-preview";
    urlSuffix = baseURL+urlSuffix;
    var createData = map.createTestData();
    let header = await map.createTestHeader();
    let createTestresult = await httpClient.request('patch',urlSuffix,JSON.stringify(createData), header);
    let testRunResp: string = await createTestresult.readBody(); 
    let testRunObj:any = JSON.parse(testRunResp);
    if(createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
        console.log(testRunObj);
        throw new Error("Error in creating test: " + testName);
    }
    if(createTestresult.message.statusCode == 201) {
        console.log("Creating a new load test '"+testName+"' ");
        console.log("Successfully created load test "+testName);
    }
    else 
        console.log("Test '"+ testName +"' already exists");

    await uploadConfigFile()
}

async function uploadTestPlan() 
{
    let filepath = map.getTestFile();
    let filename = util.getUniqueId();
    var urlSuffix = "loadtests/"+testName+"/files/"+filename+"?api-version=2022-06-01-preview";
    urlSuffix = baseURL + urlSuffix;
    var uploadData = map.uploadFileData(filepath);
    let headers = await map.UploadAndValidateHeader(uploadData)
    let uploadresult = await httpClient.request('put',urlSuffix, uploadData, headers);
    let uploadResultResp: string = await uploadresult.readBody(); 
    let uploadObj:any = JSON.parse(uploadResultResp);
    if(uploadresult.message.statusCode != 201){
        console.log(uploadObj);
        throw new Error("Error in uploading TestPlan for the created test");
    }
    else {
        console.log("Uploaded test plan for the test");
        var minutesToAdd=10;
        var startTime = new Date();
        var maxAllowedTime = new Date(startTime.getTime() + minutesToAdd*60000);
        var validationStatus = "VALIDATION_INITIATED";
        while(maxAllowedTime>(new Date()) && (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")) {
            validationStatus = await getTestAPI(true);
            await util.sleep(3000);
        }
        if(validationStatus == null || validationStatus == "VALIDATION_SUCCESS" )
            await createTestRun();
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
        for (const filepath of configFiles) {
            let filename = map.getFileName(filepath);
            var urlSuffix = "loadtests/"+testName+"/files/"+filename+"?api-version=2022-06-01-preview";
            urlSuffix = baseURL+urlSuffix;
            var uploadData = map.uploadFileData(filepath);
            let headers = await map.UploadAndValidateHeader(uploadData);

            let uploadresult = await httpClient.put(urlSuffix, uploadData, headers);
            let uploadResultResp: string = await uploadresult.readBody(); 
            let uploadObj:any = JSON.parse(uploadResultResp);
            if(uploadresult.message.statusCode != 201){
                console.log(uploadObj);
                throw new Error("Error in uploading config file for the created test");
            }
        }
    }
    var statuscode = await uploadPropertyFile();
    if(statuscode === 201){
        await uploadTestPlan();
    }
}
async function uploadPropertyFile() 
{
    let propertyFile = map.getPropertyFile();
    if(propertyFile != undefined) {
        let filename = util.getUniqueId();
        console.log(propertyFile);
        var urlSuffix = "loadtests/"+testName+"/files/"+filename+"?api-version=2022-06-01-preview&fileType=1";
        urlSuffix = baseURL + urlSuffix;
        var uploadData = map.uploadFileData(propertyFile);
        let headers = await map.UploadAndValidateHeader(uploadData)
        let uploadresult = await httpClient.request('put',urlSuffix, uploadData, headers);
        let uploadResultResp: string = await uploadresult.readBody(); 
        let uploadObj:any = JSON.parse(uploadResultResp);
        if(uploadresult.message.statusCode != 201){
            console.log(uploadObj);
            throw new Error("Error in uploading TestPlan for the created test");
        }
    }
    return 201;
}

async function createTestRun() {
    const tenantId = map.getTenantId();
    const testRunId = util.getUniqueId();
    var urlSuffix = "testruns/"+testRunId+"?tenantId="+tenantId+"&api-version=2022-06-01-preview";
    urlSuffix = baseURL+urlSuffix;
    const ltres: string = core.getInput('loadTestResource');
    const subName = await map.getSubName();
    try {
        var startData = map.startTestData(testRunId);
        console.log("Creating and running a testRun for the test");
        let header = await map.createTestHeader();
        let startTestresult = await httpClient.patch(urlSuffix,JSON.stringify(startData),header);
        let startResp: string = await startTestresult.readBody(); 
        let testRunDao:any = JSON.parse(startResp);
        if(startTestresult.message.statusCode != 200) {
            console.log(testRunDao);
            throw new Error("Error in running the test");
        }   
        let startTime = new Date();
        let testRunName = testRunDao.displayName;
        let status = testRunDao.status;
        if(status == "ACCEPTED") {
            console.log("\nView the load test run in Azure portal by following the steps:")
            console.log("1. Go to your Azure Load Testing resource '"+ltres+"' in subscription '"+subName+"'")
            console.log("2. On the Tests page, go to test '"+testName+"'")
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
    var urlSuffix = "testruns/"+testRunId+"?api-version=2021-07-01-preview";
    urlSuffix = baseURL+urlSuffix;
    while(testStatus != "DONE" && testStatus != "FAILED" && testStatus != "CANCELLED") 
    {
        let header = await map.getTestRunHeader();
        let testRunResult = await httpClient.get(urlSuffix, header);
        let testRunResp: string = await testRunResult.readBody(); 
        let testRunObj:any = JSON.parse(testRunResp);
        testStatus = testRunObj.status;
        if(testStatus == "DONE") {
            await util.sleep(30000);
            let vusers = null;
            let count = 0;
            while(vusers == null && count < 4){
                let header = await map.getTestRunHeader();
                let testRunResult = await httpClient.get(urlSuffix, header);
                let testRunResp: string = await testRunResult.readBody(); 
                testRunObj = JSON.parse(testRunResp);
                vusers = testRunObj.vusers;
                count++;
            }
            util.printTestDuration(testRunObj.vusers, startTime);
            if(testRunObj.passFailCriteria != null && testRunObj.passFailCriteria.passFailMetrics != null)
                util.printCriteria(testRunObj.passFailCriteria.passFailMetrics)
            if(testRunObj.testRunStatistics != null)
                util.printClientMetrics(testRunObj.testRunStatistics);
            var testResultUrl = util.getResultFolder(testRunObj.testArtifacts);
            if(testResultUrl != null) {
                const response = await httpClient.get(testResultUrl);
                if (response.message.statusCode != 200) {
                    throw new Error("Error in fetching results ");
                }
                else {
                    await util.getResultsFile(response);
                }
            }
            if(testRunObj.testResult != null && testRunObj.testResult === "FAILED") {
                core.setFailed("TestResult: "+ testRunObj.testResult);
                return;
            }
            return;
        }
        else if(testStatus === "FAILED" || testStatus === "CANCELLED") {
            core.setFailed("TestStatus: "+ testStatus);
            return;
        }
        else 
        {
            if(testStatus != "DONE" && testStatus != "FAILED" && testStatus != "CANCELLED")
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

    let armEndpoint = "https://management.azure.com"+id+"?api-version=2022-04-15-preview";
    if(env == "canary") {
        armEndpoint = "https://eastus2euap.management.azure.com"+id+"?api-version=2022-04-15-preview";
    }
    if(env == "dogfood") {
        armEndpoint = "https://api-dogfood.resources.windows-int.net"+id+"?api-version=2022-04-15-preview";  
    }
    var header = map.dataPlaneHeader();
    let response = await httpClient.get(armEndpoint, header);
    if(response.message.statusCode != 200) {
        var resource_name: string = core.getInput('loadTestResource');
        var message = "The Azure Load Testing resource "+ resource_name +" does not exist. Please provide an existing resource.";
        throw new Error(message);
    }
    let result: string = await response.readBody();
    let respObj:any = JSON.parse(result);
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