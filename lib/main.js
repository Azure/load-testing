"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExistingEnv = exports.getExistingParams = exports.getExistingAutoAbortCriteria = exports.getExistingCriteria = void 0;
const core = __importStar(require("@actions/core"));
const httpc = require("typed-rest-client/HttpClient");
const map = __importStar(require("./mappers"));
const util = __importStar(require("./util"));
const fs = __importStar(require("fs"));
const util_1 = require("util");
const resultFolder = 'loadTest';
let baseURL = '2631075d-e908-4f0c-8f75-0f247b540ef4.centraluseuap.cnt-canary.loadtesting.azure.com';
const httpClient = new httpc.HttpClient('MALT-GHACTION');
let testId = '';
let existingCriteria = {};
let existingAutoAbortCriteria = {};
let existingParams = {};
let existingEnv = {};
var file_type;
(function (file_type) {
    file_type["JMX_FILE"] = "JMX_FILE";
    file_type["USER_PROPERTIES"] = "USER_PROPERTIES";
    file_type["ADDITIONAL_ARTIFACTS"] = "ADDITIONAL_ARTIFACTS";
})(file_type || (file_type = {}));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield map.getInputParams();
            yield getLoadTestResource();
            testId = map.getTestId();
            yield getTestAPI(false);
            if (fs.existsSync(resultFolder)) {
                util.deleteFile(resultFolder);
            }
            fs.mkdirSync(resultFolder);
            yield createTestAPI();
        }
        catch (err) {
            core.setFailed(err.message);
        }
    });
}
function getTestAPI(validate) {
    return __awaiter(this, void 0, void 0, function* () {
        var urlSuffix = "tests/" + testId + "?api-version=2022-11-01";
        urlSuffix = baseURL + urlSuffix;
        let header = yield map.getTestHeader();
        let testResult = yield httpClient.get(urlSuffix, header);
        if (testResult.message.statusCode == 401 || testResult.message.statusCode == 403) {
            var message = "Service Principal does not have sufficient permissions. Please assign "
                + "the Load Test Contributor role to the service principal. Follow the steps listed at "
                + "https://docs.microsoft.com/azure/load-testing/tutorial-cicd-github-actions#configure-the-github-actions-workflow-to-run-a-load-test ";
            throw new Error(message);
        }
        if (testResult.message.statusCode == 200) {
            let testObj = yield util.getResultObj(testResult);
            if (testObj == null) {
                throw new Error(util.ErrorCorrection(testResult));
            }
            var testFile = testObj.inputArtifacts;
            if (validate) {
                return testFile.testScriptFileInfo.validationStatus;
            }
            else {
                if (!(0, util_1.isNullOrUndefined)(testObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testObj.passFailCriteria.passFailMetrics))
                    existingCriteria = testObj.passFailCriteria.passFailMetrics;
                if (testObj.secrets != null)
                    existingParams = testObj.secrets;
                if (testObj.environmentVariables != null)
                    existingEnv = testObj.environmentVariables;
                if (testFile.testScriptUrl != null)
                    yield deleteFileAPI(testFile.testScriptFileInfo.filename);
                if (testFile.userPropUrl != null)
                    yield deleteFileAPI(testFile.userPropFileInfo.filename);
            }
        }
    });
}
function deleteFileAPI(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        var urlSuffix = "tests/" + testId + "/files/" + filename + "?api-version=2022-11-01";
        urlSuffix = baseURL + urlSuffix;
        let header = yield map.getTestHeader();
        let delFileResult = yield httpClient.del(urlSuffix, header);
        if (delFileResult.message.statusCode != 204) {
            let delFileObj = yield util.getResultObj(delFileResult);
            let Message = delFileObj ? delFileObj.message : util.ErrorCorrection(delFileResult);
            throw new Error(Message);
        }
    });
}
function createTestAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        var urlSuffix = "tests/" + testId + "?api-version=2022-11-01";
        urlSuffix = baseURL + urlSuffix;
        var createData = map.createTestData();
        let header = yield map.createTestHeader();
        let createTestresult = yield httpClient.request('patch', urlSuffix, JSON.stringify(createData), header);
        if (createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
            let testRunObj = yield util.getResultObj(createTestresult);
            console.log(testRunObj ? testRunObj : util.ErrorCorrection(createTestresult));
            throw new Error("Error in creating test: " + testId);
        }
        if (createTestresult.message.statusCode == 201) {
            console.log("Creating a new load test '" + testId + "' ");
            console.log("Successfully created load test " + testId);
        }
        else
            console.log("Test '" + testId + "' already exists");
        yield uploadConfigFile();
    });
}
function uploadTestPlan() {
    return __awaiter(this, void 0, void 0, function* () {
        /*   let filepath = map.getTestFile();
           let filename = map.getFileName(filepath);
           var urlSuffix = "tests/"+testId+"/files/"+filename+"?api-version=2022-11-01";
           urlSuffix = baseURL + urlSuffix;
           var uploadData = map.uploadFileData(filepath);
           let headers = await map.UploadAndValidateHeader(uploadData)
           let uploadresult = await httpClient.request('put',urlSuffix, uploadData, headers);
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
                   validationStatus = await getTestAPI(true);
                   await util.sleep(3000);
               }
               if(validationStatus == null || validationStatus == "VALIDATION_SUCCESS" )
                   await createTestRun();
               else if(validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")
                   throw new Error("TestPlan validation timeout. Please try again.")
               else
                   throw new Error("TestPlan validation Failed.");
           }*/
    });
}
function uploadConfigFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let configFiles = map.getConfigFiles();
        if (configFiles != undefined && configFiles.length > 0) {
            for (const filepath of configFiles) {
                let filename = map.getFileName(filepath);
                var urlSuffix = "tests/" + testId + "/files/" + filename + "?api-version=2022-11-01";
                urlSuffix = baseURL + urlSuffix;
                var uploadData = map.uploadFileData(filepath);
                let headers = yield map.UploadAndValidateHeader(uploadData);
                let uploadresult = yield httpClient.request('put', urlSuffix, uploadData, headers);
                if (uploadresult.message.statusCode != 201) {
                    let uploadObj = yield util.getResultObj(uploadresult);
                    console.log(uploadObj ? uploadObj : util.ErrorCorrection(uploadresult));
                    throw new Error("Error in uploading config file for the created test");
                }
            }
        }
        var statuscode = yield uploadPropertyFile();
        if (statuscode === 201) {
            yield uploadTestPlan();
        }
    });
}
function uploadPropertyFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let propertyFile = map.getPropertyFile();
        if (propertyFile != undefined) {
            let filename = map.getFileName(propertyFile);
            var urlSuffix = "tests/" + testId + "/files/" + filename + "?api-version=2022-11-01&fileType=" + file_type.USER_PROPERTIES;
            urlSuffix = baseURL + urlSuffix;
            var uploadData = map.uploadFileData(propertyFile);
            let headers = yield map.UploadAndValidateHeader(uploadData);
            let uploadresult = yield httpClient.request('put', urlSuffix, uploadData, headers);
            if (uploadresult.message.statusCode != 201) {
                let uploadObj = yield util.getResultObj(uploadresult);
                console.log(uploadObj ? uploadObj : util.ErrorCorrection(uploadresult));
                throw new Error("Error in uploading TestPlan for the created test");
            }
        }
        return 201;
    });
}
function createTestRun() {
    return __awaiter(this, void 0, void 0, function* () {
        const tenantId = map.getTenantId();
        const testRunId = util.getUniqueId();
        var urlSuffix = "test-runs/" + testRunId + "?tenantId=" + tenantId + "&api-version=2022-11-01";
        urlSuffix = baseURL + urlSuffix;
        const ltres = core.getInput('loadTestResource');
        const runDisplayName = core.getInput('loadTestRunName');
        const runDescription = core.getInput('loadTestRunDescription');
        const subName = yield map.getSubName();
        try {
            var startData = map.startTestData(testRunId, runDisplayName, runDescription);
            console.log("Creating and running a testRun for the test");
            let header = yield map.createTestHeader();
            let startTestresult = yield httpClient.patch(urlSuffix, JSON.stringify(startData), header);
            let testRunDao = yield util.getResultObj(startTestresult);
            if (startTestresult.message.statusCode != 200 && startTestresult.message.statusCode != 201) {
                console.log(testRunDao ? testRunDao : util.ErrorCorrection(startTestresult));
                throw new Error("Error in running the test");
            }
            let startTime = new Date();
            let testRunName = testRunDao.displayName;
            let status = testRunDao.status;
            if (status == "ACCEPTED") {
                console.log("\nView the load test run in Azure portal by following the steps:");
                console.log("1. Go to your Azure Load Testing resource '" + ltres + "' in subscription '" + subName + "'");
                console.log("2. On the Tests page, go to test '" + testId + "'");
                console.log("3. Go to test run '" + testRunName + "'\n");
                yield getTestRunAPI(testRunId, status, startTime);
            }
        }
        catch (err) {
            if (!err.message)
                err.message = "Error in running the test";
            throw new Error(err.message);
        }
    });
}
function getTestRunAPI(testRunId, testStatus, startTime) {
    return __awaiter(this, void 0, void 0, function* () {
        var urlSuffix = "test-runs/" + testRunId + "?api-version=2022-11-01";
        urlSuffix = baseURL + urlSuffix;
        while (!util.isTerminalTestStatus(testStatus)) {
            let header = yield map.getTestRunHeader();
            let testRunResult = yield httpClient.get(urlSuffix, header);
            let testRunObj = yield util.getResultObj(testRunResult);
            if (testRunObj == null) {
                throw new Error(util.ErrorCorrection(testRunResult));
            }
            testStatus = testRunObj.status;
            if (util.isTerminalTestStatus(testStatus)) {
                let vusers = null;
                let count = 0;
                // Polling for max 3 min for statistics and pass fail criteria to populate
                while ((0, util_1.isNullOrUndefined)(vusers) && count < 18) {
                    yield util.sleep(10000);
                    let header = yield map.getTestRunHeader();
                    let testRunResult = yield httpClient.get(urlSuffix, header);
                    testRunObj = yield util.getResultObj(testRunResult);
                    if (testRunObj == null) {
                        throw new Error(util.ErrorCorrection(testRunResult));
                    }
                    vusers = testRunObj.virtualUsers;
                    count++;
                }
                util.printTestDuration(testRunObj.virtualUsers, startTime);
                if (!(0, util_1.isNullOrUndefined)(testRunObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testRunObj.passFailCriteria.passFailMetrics))
                    util.printCriteria(testRunObj.passFailCriteria.passFailMetrics);
                if (testRunObj.testRunStatistics != null)
                    util.printClientMetrics(testRunObj.testRunStatistics);
                var testResultUrl = util.getResultFolder(testRunObj.testArtifacts);
                if (testResultUrl != null) {
                    const response = yield httpClient.get(testResultUrl);
                    if (response.message.statusCode != 200) {
                        throw new Error("Error in fetching results ");
                    }
                    else {
                        yield util.getResultsFile(response);
                    }
                }
                if (testRunObj.status === "FAILED" || testRunObj.status === "CANCELLED") {
                    core.setFailed("TestStatus: " + testRunObj.status);
                    return;
                }
                if (testRunObj.testResult === "FAILED" || testRunObj.testResult === "CANCELLED") {
                    core.setFailed("TestResult: " + testRunObj.testResult);
                    return;
                }
                return;
            }
            else {
                if (!util.isTerminalTestStatus(testStatus)) {
                    if (testStatus === "DEPROVISIONING" || testStatus === "DEPROVISIONED" || testStatus != "EXECUTED")
                        yield util.sleep(5000);
                    else
                        yield util.sleep(20000);
                }
            }
        }
    });
}
function getLoadTestResource() {
    return __awaiter(this, void 0, void 0, function* () {
        let env = "prod";
        let id = map.getResourceId();
        let armEndpoint = "https://management.azure.com" + id + "?api-version=2022-12-01";
        if (env == "canary") {
            armEndpoint = "https://eastus2euap.management.azure.com" + id + "?api-version=2022-12-01";
        }
        if (env == "dogfood") {
            armEndpoint = "https://api-dogfood.resources.windows-int.net" + id + "?api-version=2022-12-01";
        }
        var header = map.dataPlaneHeader();
        let response = yield httpClient.get(armEndpoint, header);
        var resource_name = core.getInput('loadTestResource');
        if (response.message.statusCode == 404) {
            var message = "The Azure Load Testing resource " + resource_name + " does not exist. Please provide an existing resource.";
            throw new Error(message);
        }
        let respObj = yield util.getResultObj(response);
        if (response.message.statusCode != 200) {
            console.log(respObj ? respObj : util.ErrorCorrection(response));
            throw new Error("Error fetching resource " + resource_name);
        }
        let dataPlaneUrl = respObj.properties.dataPlaneURI;
        baseURL = 'https://' + dataPlaneUrl + '/';
    });
}
function getExistingCriteria() {
    return existingCriteria;
}
exports.getExistingCriteria = getExistingCriteria;
function getExistingAutoAbortCriteria() {
    return existingAutoAbortCriteria;
}
exports.getExistingAutoAbortCriteria = getExistingAutoAbortCriteria;
function getExistingParams() {
    return existingParams;
}
exports.getExistingParams = getExistingParams;
function getExistingEnv() {
    return existingEnv;
}
exports.getExistingEnv = getExistingEnv;
run();
