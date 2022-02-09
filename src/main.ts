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
        await getTestAPI();
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
async function getTestAPI() {
    var urlSuffix = "loadtests/"+testName+"?api-version=2021-07-01-preview";
    urlSuffix = baseURL+urlSuffix;
    let header = await map.getTestHeader();
    let testResult = await httpClient.get(urlSuffix, header); 
    if(testResult.message.statusCode == 200) {
        let testResp: string = await testResult.readBody(); 
        let testObj:any = JSON.parse(testResp);  
        if(testObj.passFailCriteria != null && testObj.passFailCriteria.passFailMetrics)
            existingCriteria = testObj.passFailCriteria.passFailMetrics;
        if(testObj.secrets != null)
            existingParams = testObj.secrets;
        if(testObj.environmentVariables != null)
            existingEnv = testObj.environmentVariables;
    }   
}
async function createTestAPI() {
    var urlSuffix = "loadtests/"+testName+"?api-version=2021-07-01-preview";
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

    await uploadTestPlan();
}

async function uploadTestPlan() 
{
    let filepath = map.getTestFile();
    let filename = map.getFileName(filepath);
    var urlSuffix = "file/"+filename+":validate?api-version=2021-07-01-preview";
    urlSuffix = baseURL+urlSuffix;
    var uploadData = map.uploadFileData(filepath);
    let headers = await map.UploadAndValidateHeader(uploadData)
    let validateresult = await httpClient.post(urlSuffix, uploadData, headers);
    if(validateresult.message.statusCode != 200)
        throw new Error("Invalid TestPlan");
    else {
        urlSuffix = "loadtests/"+testName+"/files/"+filename+"?api-version=2021-07-01-preview";
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
            var statuscode = await uploadConfigFile();
            if(statuscode == 201)
                await createTestRun();
        }
    }
}
async function uploadConfigFile() 
{
    let configFiles = map.getConfigFiles();
    if(configFiles != undefined && configFiles.length > 0) {
        for (const filepath of configFiles) {
            let filename = map.getFileName(filepath);
            var urlSuffix = "loadtests/"+testName+"/files/"+filename+"?api-version=2021-07-01-preview";
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
    return 201;
}

async function createTestRun() {
    const tenantId = map.getTenantId();
    const testRunId = util.getUniqueId();
    var urlSuffix = "testruns/"+testRunId+"?tenantId="+tenantId+"&api-version=2021-07-01-preview";
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
            let header = await map.getTestRunHeader();
            let testRunResult = await httpClient.get(urlSuffix, header);
            let testRunResp: string = await testRunResult.readBody(); 
            let testRunObj:any = JSON.parse(testRunResp);
            util.printTestDuration(testRunObj.vusers, startTime);
            if(testRunObj.passFailCriteria.passFailMetrics != null && testRunObj.passFailCriteria.passFailMetrics != undefined)
                util.printCriteria(testRunObj.passFailCriteria.passFailMetrics)
            if(testRunObj.testRunStatistics != null && testRunObj.testRunStatistics != undefined)
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

    let armEndpoint = "https://management.azure.com"+id+"?api-version=2021-12-01-preview";
    if(env == "canary") {
        armEndpoint = "https://eastus2euap.management.azure.com"+id+"?api-version=2021-12-01-preview";
    }
    if(env == "dogfood") {
        armEndpoint = "https://api-dogfood.resources.windows-int.net"+id+"?api-version=2021-12-01-preview";  
    }
    var header = map.dataPlaneHeader();
    let response = await httpClient.get(armEndpoint, header);
    let result: string = await response.readBody();
    let respObj:any = JSON.parse(result);
    if(response.message.statusCode != 200) {
        console.log(respObj.error.message);
        throw new Error();
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