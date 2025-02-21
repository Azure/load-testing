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
exports.APISupport = void 0;
const util_1 = require("util");
const UtilModels_1 = require("./UtilModels");
const TestKind_1 = require("./engine/TestKind");
const Util = __importStar(require("./util"));
const FileUtils = __importStar(require("./FileUtils"));
const core = __importStar(require("@actions/core"));
const FetchUtil = __importStar(require("./FetchHelper"));
const InputConstants = __importStar(require("./InputConstants"));
class APISupport {
    constructor(authContext, yamlModel) {
        this.baseURL = '';
        this.existingParams = { secrets: {}, env: {}, passFailCriteria: {}, appComponents: new Map() };
        this.authContext = authContext;
        this.yamlModel = yamlModel;
        this.testId = this.yamlModel.testId;
    }
    getResource() {
        return __awaiter(this, void 0, void 0, function* () {
            let id = this.authContext.resourceId;
            let armUrl = this.authContext.armEndpoint;
            let armEndpointSuffix = id + "?api-version=" + UtilModels_1.ApiVersionConstants.cp2022Version;
            let armEndpoint = new URL(armEndpointSuffix, armUrl);
            let header = yield this.authContext.armTokenHeader();
            let response = yield FetchUtil.httpClientRetries(armEndpoint.toString(), header, UtilModels_1.FetchCallType.get, 3, "");
            let resource_name = core.getInput(InputConstants.loadTestResource);
            if (response.message.statusCode == 404) {
                var message = `The Azure Load Testing resource ${resource_name} does not exist. Please provide an existing resource.`;
                throw new Error(message);
            }
            let respObj = yield Util.getResultObj(response);
            if (response.message.statusCode != 200) {
                console.log(respObj ? respObj : Util.ErrorCorrection(response));
                throw new Error("Error fetching resource " + resource_name);
            }
            let dataPlaneUrl = respObj.properties.dataPlaneURI;
            this.baseURL = 'https://' + dataPlaneUrl + '/';
        });
    }
    getTestAPI(validate, returnTestObj = false) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            var urlSuffix = "tests/" + this.testId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let testResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.get, 3, "");
            if (testResult.message.statusCode == 401 || testResult.message.statusCode == 403) {
                var message = "Service Principal does not have sufficient permissions. Please assign "
                    + "the Load Test Contributor role to the service principal. Follow the steps listed at "
                    + "https://docs.microsoft.com/azure/load-testing/tutorial-cicd-github-actions#configure-the-github-actions-workflow-to-run-a-load-test ";
                throw new Error(message);
            }
            if (testResult.message.statusCode != 200 && testResult.message.statusCode != 201) {
                if (validate) { // validate is called, then get should not be false, and this validate had retries because of the conflicts in jmx test, so lets not print in the console, instead put this in the error itself.
                    let errorObj = yield Util.getResultObj(testResult);
                    let err = ((_a = errorObj === null || errorObj === void 0 ? void 0 : errorObj.error) === null || _a === void 0 ? void 0 : _a.message) ? (_b = errorObj === null || errorObj === void 0 ? void 0 : errorObj.error) === null || _b === void 0 ? void 0 : _b.message : Util.ErrorCorrection(testResult);
                    throw new Error(err);
                }
                else if (!validate && testResult.message.statusCode != 404) { // if not validate, then its to check if it is edit or create thats all, so it should not throw the error for 404.
                    let testObj = yield Util.getResultObj(testResult);
                    console.log(testObj ? testObj : Util.ErrorCorrection(testResult));
                    throw new Error("Error in getting the test.");
                }
                // note : kumarmoh 
                /// else {
                //    do nothing if the validate = false and status code is 404, as it is for create test.
                // } this is just for comment
            }
            if (testResult.message.statusCode == 200) {
                let testObj = yield Util.getResultObj(testResult);
                if (testObj == null) {
                    throw new Error(Util.ErrorCorrection(testResult));
                }
                let inputScriptFileInfo = testObj.kind == TestKind_1.TestKind.URL ? (_c = testObj.inputArtifacts) === null || _c === void 0 ? void 0 : _c.urlTestConfigFileInfo : (_d = testObj.inputArtifacts) === null || _d === void 0 ? void 0 : _d.testScriptFileInfo;
                if (validate) {
                    if (returnTestObj) {
                        return [inputScriptFileInfo === null || inputScriptFileInfo === void 0 ? void 0 : inputScriptFileInfo.validationStatus, testObj];
                    }
                    return inputScriptFileInfo === null || inputScriptFileInfo === void 0 ? void 0 : inputScriptFileInfo.validationStatus;
                }
                else {
                    if (!(0, util_1.isNullOrUndefined)(testObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testObj.passFailCriteria.passFailMetrics))
                        this.existingParams.passFailCriteria = testObj.passFailCriteria.passFailMetrics;
                    if (testObj.secrets != null) {
                        this.existingParams.secrets = testObj.secrets;
                    }
                    if (testObj.environmentVariables != null) {
                        this.existingParams.env = testObj.environmentVariables;
                    }
                }
            }
        });
    }
    getAppComponents() {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/app-components/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let appComponentsResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.get, 3, "");
            if (appComponentsResult.message.statusCode == 200) {
                let appComponentsObj = yield Util.getResultObj(appComponentsResult);
                for (let guid in appComponentsObj.components) {
                    let resourceId = (_b = (_a = appComponentsObj.components[guid]) === null || _a === void 0 ? void 0 : _a.resourceId) !== null && _b !== void 0 ? _b : "";
                    if (this.existingParams.appComponents.has(resourceId === null || resourceId === void 0 ? void 0 : resourceId.toLowerCase())) {
                        let existingGuids = (_c = this.existingParams.appComponents.get(resourceId === null || resourceId === void 0 ? void 0 : resourceId.toLowerCase())) !== null && _c !== void 0 ? _c : [];
                        existingGuids.push(guid);
                        this.existingParams.appComponents.set(resourceId.toLowerCase(), existingGuids);
                    }
                    else {
                        this.existingParams.appComponents.set(resourceId.toLowerCase(), [guid]);
                    }
                }
            }
        });
    }
    getServerMetricsConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/server-metrics-config/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let serverComponentsResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.get, 3, "");
            if (serverComponentsResult.message.statusCode == 200) {
                let serverComponentsObj = yield Util.getResultObj(serverComponentsResult);
                this.yamlModel.mergeExistingServerCriteria(serverComponentsObj);
            }
        });
    }
    deleteFileAPI(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            var urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.delete);
            let delFileResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.delete, 3, "");
            if (delFileResult.message.statusCode != 204) {
                let errorObj = yield Util.getResultObj(delFileResult);
                let Message = errorObj ? errorObj.message : Util.ErrorCorrection(delFileResult);
                throw new Error(Message);
            }
        });
    }
    createTestAPI() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let createData = this.yamlModel.getCreateTestData(this.existingParams);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let createTestresult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(createData));
            if (createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(createTestresult);
                console.log(errorObj ? errorObj : Util.ErrorCorrection(createTestresult));
                throw new Error("Error in creating test: " + this.testId);
            }
            if (createTestresult.message.statusCode == 201) {
                console.log("Creating a new load test " + this.testId);
                console.log("Successfully created load test " + this.testId);
            }
            else {
                console.log("Test '" + this.testId + "' already exists");
                // test script will anyway be updated by the ado in later steps, this will be error if the test script is not present in the test.
                // this will be error in the url tests when the quick test is getting updated to the url test. so removing this.
                let testObj = yield Util.getResultObj(createTestresult);
                var testFiles = testObj.inputArtifacts;
                if (testFiles.userPropUrl != null) {
                    console.log(`Deleting the existing UserProperty file.`);
                    yield this.deleteFileAPI(testFiles.userPropFileInfo.fileName);
                }
                if (testFiles.testScriptFileInfo != null) {
                    console.log(`Deleting the existing TestScript file.`);
                    yield this.deleteFileAPI(testFiles.testScriptFileInfo.fileName);
                }
                if (testFiles.additionalFileInfo != null) {
                    // delete existing files which are not present in yaml, the files which are in yaml will anyway be uploaded again.
                    let existingFiles = [];
                    let file;
                    for (file of testFiles.additionalFileInfo) {
                        existingFiles.push(file.fileName);
                    }
                    for (let file of this.yamlModel.configurationFiles) {
                        file = this.yamlModel.getFileName(file);
                        let indexOfFile = existingFiles.indexOf(file);
                        if (indexOfFile != -1) {
                            existingFiles.splice(indexOfFile, 1);
                        }
                    }
                    for (let file of this.yamlModel.zipArtifacts) {
                        file = this.yamlModel.getFileName(file);
                        let indexOfFile = existingFiles.indexOf(file);
                        if (indexOfFile != -1) {
                            existingFiles.splice(indexOfFile, 1);
                        }
                    }
                    if (existingFiles.length > 0) {
                        console.log(`Deleting the ${existingFiles.length} existing test file(s) which is(are) not in the configuration yaml file.`);
                    }
                    for (const file of existingFiles) {
                        yield this.deleteFileAPI(file);
                    }
                }
            }
            yield this.uploadConfigFile();
        });
    }
    patchAppComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/app-components/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let appComponentsData = this.yamlModel.getAppComponentsData();
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let appComponentsResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(appComponentsData));
            if (!(0, util_1.isNullOrUndefined)(appComponentsData === null || appComponentsData === void 0 ? void 0 : appComponentsData.components) && Object.keys(appComponentsData.components).length == 0) {
                return;
            }
            if (appComponentsResult.message.statusCode != 200 && appComponentsResult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(appComponentsResult);
                console.log(errorObj ? errorObj : Util.ErrorCorrection(appComponentsResult));
                throw new Error("Error in updating app components");
            }
            else {
                console.log("Updated app components successfully");
                yield this.getServerMetricsConfig();
                yield this.patchServerMetrics();
            }
        });
    }
    patchServerMetrics() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/server-metrics-config/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            let serverMetricsData = {
                metrics: this.yamlModel.serverMetricsConfig
            };
            if (!(0, util_1.isNullOrUndefined)(serverMetricsData === null || serverMetricsData === void 0 ? void 0 : serverMetricsData.metrics) && Object.keys(serverMetricsData.metrics).length == 0) {
                return;
            }
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let serverMetricsResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(serverMetricsData));
            if (serverMetricsResult.message.statusCode != 200 && serverMetricsResult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(serverMetricsResult);
                console.log(errorObj ? errorObj : Util.ErrorCorrection(serverMetricsResult));
                throw new Error("Error in updating server metrics");
            }
            else {
                console.log("Updated server metrics successfully");
            }
        });
    }
    uploadTestPlan() {
        return __awaiter(this, void 0, void 0, function* () {
            let retry = 5;
            let filepath = this.yamlModel.testPlan;
            let filename = this.yamlModel.getFileName(filepath);
            let urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let fileType = UtilModels_1.FileType.TEST_SCRIPT;
            if (this.yamlModel.kind == TestKind_1.TestKind.URL) {
                fileType = UtilModels_1.FileType.URL_TEST_CONFIG;
            }
            urlSuffix = this.baseURL + urlSuffix + ("&fileType=" + fileType);
            let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.put);
            let uploadresult = yield FetchUtil.httpClientRetries(urlSuffix, headers, UtilModels_1.FetchCallType.put, 3, filepath, true);
            if (uploadresult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(uploadresult);
                console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                throw new Error("Error in uploading TestPlan for the created test");
            }
            else {
                console.log("Uploaded test plan for the test");
                let minutesToAdd = 10;
                let startTime = new Date();
                let maxAllowedTime = new Date(startTime.getTime() + minutesToAdd * 60000);
                let validationStatus = "VALIDATION_INITIATED";
                let testObj = null;
                while (maxAllowedTime > (new Date()) && (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED" || validationStatus == null)) {
                    try {
                        [validationStatus, testObj] = (yield this.getTestAPI(true, true));
                    }
                    catch (e) {
                        retry--;
                        if (retry == 0) {
                            throw new Error("Unable to validate the test plan. Please retry. Failed with error :" + e);
                        }
                    }
                    yield Util.sleep(5000);
                }
                console.log("Validation status of the test plan: " + validationStatus);
                if (validationStatus == null || validationStatus == "VALIDATION_SUCCESS") {
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
                    yield this.patchAppComponents();
                    yield this.createTestRun();
                }
                else if (validationStatus == "VALIDATION_INITIATED" || validationStatus == "NOT_VALIDATED")
                    throw new Error("TestPlan validation timeout. Please try again.");
                else
                    throw new Error("TestPlan validation Failed.");
            }
        });
    }
    uploadConfigFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let configFiles = this.yamlModel.configurationFiles;
            if (configFiles != undefined && configFiles.length > 0) {
                for (let filepath of configFiles) {
                    let filename = this.yamlModel.getFileName(filepath);
                    let urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion + ("&fileType=" + UtilModels_1.FileType.ADDITIONAL_ARTIFACTS);
                    urlSuffix = this.baseURL + urlSuffix;
                    let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.put);
                    let uploadresult = yield FetchUtil.httpClientRetries(urlSuffix, headers, UtilModels_1.FetchCallType.put, 3, filepath, true);
                    if (uploadresult.message.statusCode != 201) {
                        let errorObj = yield Util.getResultObj(uploadresult);
                        console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                        throw new Error("Error in uploading config file for the created test");
                    }
                }
                ;
                console.log(`Uploaded ${configFiles.length} configuration file(s) for the test successfully.`);
            }
            yield this.uploadZipArtifacts();
        });
    }
    uploadZipArtifacts() {
        return __awaiter(this, void 0, void 0, function* () {
            let zipFiles = this.yamlModel.zipArtifacts;
            if (zipFiles != undefined && zipFiles.length > 0) {
                console.log("Uploading and validating the zip artifacts");
                for (const filepath of zipFiles) {
                    let filename = this.yamlModel.getFileName(filepath);
                    var urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion + "&fileType=" + UtilModels_1.FileType.ZIPPED_ARTIFACTS;
                    urlSuffix = this.baseURL + urlSuffix;
                    let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.put);
                    let uploadresult = yield FetchUtil.httpClientRetries(urlSuffix, headers, UtilModels_1.FetchCallType.put, 3, filepath, true);
                    if (uploadresult.message.statusCode != 201) {
                        let errorObj = yield Util.getResultObj(uploadresult);
                        console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                        throw new Error("Error in uploading config file for the created test");
                    }
                }
                console.log(`Uploaded ${zipFiles.length} zip artifact(s) for the test successfully.`);
            }
            let statuscode = yield this.uploadPropertyFile();
            if (statuscode == 201)
                yield this.uploadTestPlan();
        });
    }
    uploadPropertyFile() {
        return __awaiter(this, void 0, void 0, function* () {
            let propertyFile = this.yamlModel.propertyFile;
            if (propertyFile != undefined && propertyFile != '') {
                let filename = this.yamlModel.getFileName(propertyFile);
                let urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion + "&fileType=" + UtilModels_1.FileType.USER_PROPERTIES;
                urlSuffix = this.baseURL + urlSuffix;
                let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.put);
                let uploadresult = yield FetchUtil.httpClientRetries(urlSuffix, headers, UtilModels_1.FetchCallType.put, 3, propertyFile, true);
                if (uploadresult.message.statusCode != 201) {
                    let errorObj = yield Util.getResultObj(uploadresult);
                    console.log(errorObj ? errorObj : Util.ErrorCorrection(uploadresult));
                    throw new Error("Error in uploading TestPlan for the created test");
                }
                console.log(`Uploaded user properties file for the test successfully.`);
            }
            return 201;
        });
    }
    createTestRun() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var startData = this.yamlModel.getStartTestData();
                const testRunId = this.yamlModel.runTimeParams.testRunId;
                let urlSuffix = "test-runs/" + testRunId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
                urlSuffix = this.baseURL + urlSuffix;
                core.exportVariable(UtilModels_1.PostTaskParameters.runId, testRunId);
                console.log("Creating and running a testRun for the test");
                let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
                let startTestresult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(startData));
                let testRunDao = yield Util.getResultObj(startTestresult);
                if (startTestresult.message.statusCode != 200 && startTestresult.message.statusCode != 201) {
                    console.log(testRunDao ? testRunDao : Util.ErrorCorrection(startTestresult));
                    throw new Error("Error in running the test");
                }
                let startTime = new Date();
                let status = testRunDao.status;
                if (status == "ACCEPTED") {
                    console.log("\nView the load test run in Azure portal by following the steps:");
                    console.log("1. Go to your Azure Load Testing resource '" + Util.getResourceNameFromResourceId(this.authContext.resourceId) + "' in subscription '" + this.authContext.subscriptionName + "'");
                    console.log("2. On the Tests page, go to test '" + this.yamlModel.displayName + "'");
                    console.log("3. Go to test run '" + testRunDao.displayName + "'\n");
                    yield this.getTestRunAPI(testRunId, status, startTime);
                }
            }
            catch (err) {
                if (!err.message)
                    err.message = "Error in running the test";
                throw new Error(err.message);
            }
        });
    }
    getTestRunAPI(testRunId, testStatus, startTime) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "test-runs/" + testRunId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            urlSuffix = this.baseURL + urlSuffix;
            while (!Util.isTerminalTestStatus(testStatus)) {
                let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
                let testRunResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.get, 3, "");
                let testRunObj = yield Util.getResultObj(testRunResult);
                if (testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201) {
                    console.log(testRunObj ? testRunObj : Util.ErrorCorrection(testRunResult));
                    throw new Error("Error in getting the test run");
                }
                testStatus = (_a = testRunObj.status) !== null && _a !== void 0 ? _a : testStatus;
                if (Util.isTerminalTestStatus(testStatus)) {
                    let vusers = null;
                    let count = 0;
                    let reportsAvailable = false;
                    console.log("Test run completed. Polling for statistics and dashboard report to populate.");
                    // Polling for max 3 min for statistics and pass fail criteria to populate
                    while ((!reportsAvailable || (0, util_1.isNullOrUndefined)(vusers)) && count < 18) {
                        yield Util.sleep(10000);
                        let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
                        let testRunResult = yield FetchUtil.httpClientRetries(urlSuffix, header, UtilModels_1.FetchCallType.get, 3, "");
                        testRunObj = yield Util.getResultObj(testRunResult);
                        if (testRunObj == null) {
                            throw new Error(Util.ErrorCorrection(testRunResult));
                        }
                        if (testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201) {
                            console.log(testRunResult ? testRunResult : Util.ErrorCorrection(testRunResult));
                            throw new Error("Error in getting the test run");
                        }
                        vusers = testRunObj.virtualUsers;
                        count++;
                        let testReport = Util.getReportFolder(testRunObj.testArtifacts);
                        if (testReport) {
                            reportsAvailable = true;
                        }
                    }
                    if (testRunObj && testRunObj.startDateTime) {
                        startTime = new Date(testRunObj.startDateTime);
                    }
                    let endTime = new Date();
                    if (testRunObj && testRunObj.endDateTime) {
                        endTime = new Date(testRunObj.endDateTime);
                    }
                    Util.printTestDuration(testRunObj);
                    if (!(0, util_1.isNullOrUndefined)(testRunObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testRunObj.passFailCriteria.passFailMetrics))
                        Util.printCriteria(testRunObj.passFailCriteria.passFailMetrics);
                    if (testRunObj.testRunStatistics != null && testRunObj.testRunStatistics != undefined)
                        Util.printClientMetrics(testRunObj.testRunStatistics);
                    core.exportVariable(UtilModels_1.PostTaskParameters.isRunCompleted, 'true');
                    console.log(process.env[UtilModels_1.PostTaskParameters.runId], process.env[UtilModels_1.PostTaskParameters.isRunCompleted]);
                    let testResultUrl = Util.getResultFolder(testRunObj.testArtifacts);
                    if (testResultUrl != null) {
                        const response = yield FetchUtil.httpClientRetries(testResultUrl, {}, UtilModels_1.FetchCallType.get, 3, "");
                        if (response.message.statusCode != 200) {
                            let respObj = yield Util.getResultObj(response);
                            console.log(respObj ? respObj : Util.ErrorCorrection(response));
                            throw new Error("Error in fetching results ");
                        }
                        else {
                            yield FileUtils.uploadFileToResultsFolder(response, UtilModels_1.resultZipFileName);
                        }
                    }
                    let testReportUrl = Util.getReportFolder(testRunObj.testArtifacts);
                    if (testReportUrl != null) {
                        const response = yield FetchUtil.httpClientRetries(testReportUrl, {}, UtilModels_1.FetchCallType.get, 3, "");
                        if (response.message.statusCode != 200) {
                            let respObj = yield Util.getResultObj(response);
                            console.log(respObj ? respObj : Util.ErrorCorrection(response));
                            throw new Error("Error in fetching report ");
                        }
                        else {
                            yield FileUtils.uploadFileToResultsFolder(response, UtilModels_1.reportZipFileName);
                        }
                    }
                    if (!(0, util_1.isNullOrUndefined)(testRunObj.testResult) && Util.isStatusFailed(testRunObj.testResult)) {
                        core.setFailed("TestResult: " + testRunObj.testResult);
                        return;
                    }
                    if (!(0, util_1.isNullOrUndefined)(testRunObj.status) && Util.isStatusFailed(testRunObj.status)) {
                        console.log("Please go to the Portal for more error details: " + testRunObj.portalUrl);
                        core.setFailed("TestStatus: " + testRunObj.status);
                        return;
                    }
                    return;
                }
                else {
                    if (!Util.isTerminalTestStatus(testStatus)) {
                        if (testStatus === "DEPROVISIONING" || testStatus === "DEPROVISIONED" || testStatus != "EXECUTED")
                            yield Util.sleep(5000);
                        else
                            yield Util.sleep(20000);
                    }
                }
            }
        });
    }
    // this api is special case and doesnot use the yamlModels, instead uses the task variables for the same, this doesnot have the initialisation too.
    stopTestRunPostProcess(baseUri, runId) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = baseUri + "test-runs/" + runId + ":stop?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.post);
            yield FetchUtil.httpClientRetries(urlSuffix, headers, UtilModels_1.FetchCallType.post, 3, '');
        });
    }
}
exports.APISupport = APISupport;
