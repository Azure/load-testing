"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
exports.getExistingEnv = exports.getExistingParams = exports.getExistingCriteria = void 0;
const core = __importStar(require("@actions/core"));
const httpc = require("typed-rest-client/HttpClient");
const map = __importStar(require("./mappers"));
const util = __importStar(require("./util"));
const fs = __importStar(require("fs"));
const resultFolder = 'loadTest';
let baseURL = '';
const httpClient = new httpc.HttpClient('MALT-GHACTION');
let testName = '';
let existingCriteria = {};
let existingParams = {};
let existingEnv = {};
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield map.getInputParams();
            yield getLoadTestResource();
            testName = map.getTestName();
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
        var urlSuffix = "loadtests/" + testName + "?api-version=2022-06-01-preview";
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
            let testResp = yield testResult.readBody();
            let testObj = JSON.parse(testResp);
            var testFile = testObj.inputArtifacts;
            if (validate)
                return testFile.testScriptUrl.validationStatus;
            else {
                if (testObj.passFailCriteria != null && testObj.passFailCriteria.passFailMetrics)
                    existingCriteria = testObj.passFailCriteria.passFailMetrics;
                if (testObj.secrets != null)
                    existingParams = testObj.secrets;
                if (testObj.environmentVariables != null)
                    existingEnv = testObj.environmentVariables;
                if (testFile.testScriptUrl != null)
                    yield deleteFileAPI(testFile.testScriptUrl.fileId);
                if (testFile.userPropUrl != null)
                    yield deleteFileAPI(testFile.userPropUrl.fileId);
            }
        }
    });
}
function deleteFileAPI(fileId) {
    return __awaiter(this, void 0, void 0, function* () {
        var urlSuffix = "loadtests/" + testName + "/files/" + fileId + "?api-version=2022-06-01-preview";
        urlSuffix = baseURL + urlSuffix;
        let header = yield map.getTestHeader();
        let delFileResult = yield httpClient.del(urlSuffix, header);
        if (delFileResult.message.statusCode != 204) {
            let delFileResp = yield delFileResult.readBody();
            let delFileObj = JSON.parse(delFileResp);
            throw new Error(delFileObj.message);
        }
    });
}
function createTestAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        var urlSuffix = "loadtests/" + testName + "?api-version=2022-06-01-preview";
        urlSuffix = baseURL + urlSuffix;
        var createData = map.createTestData();
        let header = yield map.createTestHeader();
        let createTestresult = yield httpClient.request('patch', urlSuffix, JSON.stringify(createData), header);
        let testRunResp = yield createTestresult.readBody();
        let testRunObj = JSON.parse(testRunResp);
        if (createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
            console.log(testRunObj);
            throw new Error("Error in creating test: " + testName);
        }
        if (createTestresult.message.statusCode == 201) {
            console.log("Creating a new load test '" + testName + "' ");
            console.log("Successfully created load test " + testName);
        }
        else
            console.log("Test '" + testName + "' already exists");
        yield uploadConfigFile();
    });
}
function uploadTestPlan() {
    return __awaiter(this, void 0, void 0, function* () {
        let filepath = map.getTestFile();
        let filename = util.getUniqueId();
        var urlSuffix = "loadtests/" + testName + "/files/" + filename + "?api-version=2022-06-01-preview";
        urlSuffix = baseURL + urlSuffix;
        var uploadData = map.uploadFileData(filepath);
        let headers = yield map.UploadAndValidateHeader(uploadData);
        let uploadresult = yield httpClient.request('put', urlSuffix, uploadData, headers);
        let uploadResultResp = yield uploadresult.readBody();
        let uploadObj = JSON.parse(uploadResultResp);
        if (uploadresult.message.statusCode != 201) {
            console.log(uploadObj);
            throw new Error("Error in uploading TestPlan for the created test");
        }
        else {
            console.log("Uploaded test plan for the test");
            var minutesToAdd = 10;
            var startTime = new Date();
            var maxAllowedTime = new Date(startTime.getTime() + minutesToAdd * 60000);
            var validationStatus = "VALIDATION_INITIATED";
            while (maxAllowedTime > (new Date()) && (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")) {
                validationStatus = yield getTestAPI(true);
                yield util.sleep(3000);
            }
            if (validationStatus == null || validationStatus == "VALIDATION_SUCCESS")
                yield createTestRun();
            else if (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")
                throw new Error("TestPlan validation timeout. Please try again.");
            else
                throw new Error("TestPlan validation Failed.");
        }
    });
}
function uploadConfigFile() {
    return __awaiter(this, void 0, void 0, function* () {
        let configFiles = map.getConfigFiles();
        if (configFiles != undefined && configFiles.length > 0) {
            for (const filepath of configFiles) {
                let filename = map.getFileName(filepath);
                var urlSuffix = "loadtests/" + testName + "/files/" + filename + "?api-version=2022-06-01-preview";
                urlSuffix = baseURL + urlSuffix;
                var uploadData = map.uploadFileData(filepath);
                let headers = yield map.UploadAndValidateHeader(uploadData);
                let uploadresult = yield httpClient.put(urlSuffix, uploadData, headers);
                let uploadResultResp = yield uploadresult.readBody();
                let uploadObj = JSON.parse(uploadResultResp);
                if (uploadresult.message.statusCode != 201) {
                    console.log(uploadObj);
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
            let filename = util.getUniqueId();
            console.log(propertyFile);
            var urlSuffix = "loadtests/" + testName + "/files/" + filename + "?api-version=2022-06-01-preview&fileType=1";
            urlSuffix = baseURL + urlSuffix;
            var uploadData = map.uploadFileData(propertyFile);
            let headers = yield map.UploadAndValidateHeader(uploadData);
            let uploadresult = yield httpClient.request('put', urlSuffix, uploadData, headers);
            let uploadResultResp = yield uploadresult.readBody();
            let uploadObj = JSON.parse(uploadResultResp);
            if (uploadresult.message.statusCode != 201) {
                console.log(uploadObj);
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
        var urlSuffix = "testruns/" + testRunId + "?tenantId=" + tenantId + "&api-version=2022-06-01-preview";
        urlSuffix = baseURL + urlSuffix;
        const ltres = core.getInput('loadTestResource');
        const subName = yield map.getSubName();
        try {
            var startData = map.startTestData(testRunId);
            console.log("Creating and running a testRun for the test");
            let header = yield map.createTestHeader();
            let startTestresult = yield httpClient.patch(urlSuffix, JSON.stringify(startData), header);
            let startResp = yield startTestresult.readBody();
            let testRunDao = JSON.parse(startResp);
            if (startTestresult.message.statusCode != 200) {
                console.log(testRunDao);
                throw new Error("Error in running the test");
            }
            let startTime = new Date();
            let testRunName = testRunDao.displayName;
            let status = testRunDao.status;
            if (status == "ACCEPTED") {
                console.log("\nView the load test run in Azure portal by following the steps:");
                console.log("1. Go to your Azure Load Testing resource '" + ltres + "' in subscription '" + subName + "'");
                console.log("2. On the Tests page, go to test '" + testName + "'");
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
        var urlSuffix = "testruns/" + testRunId + "?api-version=2021-07-01-preview";
        urlSuffix = baseURL + urlSuffix;
        while (testStatus != "DONE" && testStatus != "FAILED" && testStatus != "CANCELLED") {
            let header = yield map.getTestRunHeader();
            let testRunResult = yield httpClient.get(urlSuffix, header);
            let testRunResp = yield testRunResult.readBody();
            let testRunObj = JSON.parse(testRunResp);
            testStatus = testRunObj.status;
            if (testStatus == "DONE") {
                yield util.sleep(30000);
                let vusers = null;
                let count = 0;
                while (vusers == null && count < 4) {
                    let header = yield map.getTestRunHeader();
                    let testRunResult = yield httpClient.get(urlSuffix, header);
                    let testRunResp = yield testRunResult.readBody();
                    testRunObj = JSON.parse(testRunResp);
                    vusers = testRunObj.vusers;
                    count++;
                }
                util.printTestDuration(testRunObj.vusers, startTime);
                if (testRunObj.passFailCriteria != null && testRunObj.passFailCriteria.passFailMetrics != null)
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
                if (testRunObj.testResult != null && testRunObj.testResult === "FAILED") {
                    core.setFailed("TestResult: " + testRunObj.testResult);
                    return;
                }
                return;
            }
            else if (testStatus === "FAILED" || testStatus === "CANCELLED") {
                core.setFailed("TestStatus: " + testStatus);
                return;
            }
            else {
                if (testStatus != "DONE" && testStatus != "FAILED" && testStatus != "CANCELLED") {
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
        let armEndpoint = "https://management.azure.com" + id + "?api-version=2022-04-15-preview";
        if (env == "canary") {
            armEndpoint = "https://eastus2euap.management.azure.com" + id + "?api-version=2022-04-15-preview";
        }
        if (env == "dogfood") {
            armEndpoint = "https://api-dogfood.resources.windows-int.net" + id + "?api-version=2022-04-15-preview";
        }
        var header = map.dataPlaneHeader();
        let response = yield httpClient.get(armEndpoint, header);
        if (response.message.statusCode != 200) {
            var resource_name = core.getInput('loadTestResource');
            var message = "The Azure Load Testing resource " + resource_name + " does not exist. Please provide an existing resource.";
            throw new Error(message);
        }
        let result = yield response.readBody();
        let respObj = JSON.parse(result);
        let dataPlaneUrl = respObj.properties.dataPlaneURI;
        baseURL = 'https://' + dataPlaneUrl + '/';
    });
}
function getExistingCriteria() {
    return existingCriteria;
}
exports.getExistingCriteria = getExistingCriteria;
function getExistingParams() {
    return existingParams;
}
exports.getExistingParams = getExistingParams;
function getExistingEnv() {
    return existingEnv;
}
exports.getExistingEnv = getExistingEnv;
run();
