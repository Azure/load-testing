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
exports.APIService = void 0;
const UtilModels_1 = require("../models/UtilModels");
const FetchUtil = __importStar(require("../Utils/FetchUtils"));
const Util = __importStar(require("../Utils/CommonUtils"));
const util_1 = require("util");
class APIService {
    constructor(authContext) {
        this.baseURL = '';
        this.testId = '';
        this.authContext = authContext;
    }
    getDataPlaneURL(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let armUrl = this.authContext.taskParameters.armEndpoint;
            let armEndpointSuffix = id.toLowerCase() + "?api-version=" + UtilModels_1.ApiVersionConstants.cp2022Version;
            let armEndpoint = new URL(armEndpointSuffix, armUrl);
            let header = yield this.authContext.getARMTokenHeader();
            let response = yield FetchUtil.httpClientRetries(armEndpoint.toString(), header, UtilModels_1.FetchCallType.get, 3, "");
            let resourceName = Util.getResourceNameFromResourceId(id);
            if (response.message.statusCode == 200) {
                let respObj = yield Util.getResultObj(response);
                if ((_a = respObj.properties) === null || _a === void 0 ? void 0 : _a.dataPlaneURI) {
                    let dataPlaneUrl = respObj.properties.dataPlaneURI;
                    return dataPlaneUrl;
                }
                throw new Error(`The dataplane URL is not present for the load test resource ${resourceName}, this resource cannot be used for running the tests. Please provide a valid resource.`);
            }
            if (response.message.statusCode == 404) {
                var message = `The Azure Load Testing resource ${resourceName} does not exist. Please provide an existing resource.`;
                throw new Error(message);
            }
            let errorObj = yield Util.getResultObj(response);
            console.log(errorObj ? errorObj : Util.errorCorrection(response));
            throw new Error("Error fetching resource " + resourceName);
        });
    }
    setBaseURL(dataPlaneUrl) {
        this.baseURL = "https://" + dataPlaneUrl + "/";
    }
    setTestId(id) {
        this.testId = id;
    }
    getTestAPI() {
        return __awaiter(this, arguments, void 0, function* (allow404 = false) {
            var _a, _b;
            let urlSuffix = "tests/" + this.testId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let testResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.get, 3, "");
            if (testResult.message.statusCode == 200) {
                let testObj = yield Util.getResultObj(testResult);
                if (testObj == null) {
                    throw new Error(Util.errorCorrection(testResult));
                }
                return testObj;
            }
            else if (testResult.message.statusCode == 404 && allow404) {
                return null;
            }
            if (testResult.message.statusCode == 401 || testResult.message.statusCode == 403) {
                var message = "Service Principal does not have sufficient permissions. Please assign "
                    + "the Load Test Contributor role to the service principal. Follow the steps listed at "
                    + "https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=github#configure-the-github-actions-workflow-to-run-a-load-test";
                throw new Error(message);
            }
            let errorObj = yield Util.getResultObj(testResult);
            let err = ((_a = errorObj === null || errorObj === void 0 ? void 0 : errorObj.error) === null || _a === void 0 ? void 0 : _a.message) ? (_b = errorObj === null || errorObj === void 0 ? void 0 : errorObj.error) === null || _b === void 0 ? void 0 : _b.message : Util.errorCorrection(testResult);
            throw new Error(err);
        });
    }
    getAppComponents() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/app-components/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let appComponentsResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.get, 3, "");
            if (appComponentsResult.message.statusCode == 200) {
                let appComponentsObj = yield Util.getResultObj(appComponentsResult);
                return appComponentsObj;
            }
            return null;
        });
    }
    getServerMetricsConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/server-metrics-config/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let serverComponentsResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.get, 3, "");
            if (serverComponentsResult.message.statusCode == 200) {
                let serverComponentsObj = yield Util.getResultObj(serverComponentsResult);
                return serverComponentsObj;
            }
            return null;
        });
    }
    uploadFile(filepath_1, fileType_1) {
        return __awaiter(this, arguments, void 0, function* (filepath, fileType, retries = 3) {
            let filename = Util.getFileName(filepath);
            let urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion + ("&fileType=" + fileType);
            let url = new URL(urlSuffix, this.baseURL);
            let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.put);
            let uploadresult = yield FetchUtil.httpClientRetries(url.toString(), headers, UtilModels_1.FetchCallType.put, retries, filepath, true);
            if (uploadresult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(uploadresult);
                console.log(errorObj ? errorObj : Util.errorCorrection(uploadresult));
                throw new Error(`Error in uploading file: ${filename} for the created test`);
            }
        });
    }
    deleteFileAPI(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            var urlSuffix = "tests/" + this.testId + "/files/" + filename + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.delete);
            let delFileResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.delete, 3, "");
            if (delFileResult.message.statusCode != 204) {
                let errorObj = yield Util.getResultObj(delFileResult);
                let Message = errorObj ? errorObj.message : Util.errorCorrection(delFileResult);
                throw new Error(Message);
            }
            return;
        });
    }
    createTestAPI(createData) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let createTestresult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(createData));
            if (createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(createTestresult);
                console.log(errorObj ? errorObj : Util.errorCorrection(createTestresult));
                throw new Error("Error in creating test: " + this.testId);
            }
            let testObj = yield Util.getResultObj(createTestresult);
            return testObj;
        });
    }
    patchAppComponents(appComponentsData) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/app-components/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            if (!(0, util_1.isNullOrUndefined)(appComponentsData === null || appComponentsData === void 0 ? void 0 : appComponentsData.components) && Object.keys(appComponentsData.components).length == 0) {
                return null;
            }
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let appComponentsResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(appComponentsData));
            if ((appComponentsResult.message.statusCode != 200 && appComponentsResult.message.statusCode != 201)) {
                let errorObj = yield Util.getResultObj(appComponentsResult);
                console.log(errorObj ? errorObj : Util.errorCorrection(appComponentsResult));
                throw new Error("Error in updating app components");
            }
            let appComponentsObj = yield Util.getResultObj(appComponentsResult);
            return appComponentsObj;
        });
    }
    patchServerMetricsConfig(serverMetricsData) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "tests/" + this.testId + "/server-metrics-config/" + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            if (!(0, util_1.isNullOrUndefined)(serverMetricsData === null || serverMetricsData === void 0 ? void 0 : serverMetricsData.metrics) && Object.keys(serverMetricsData.metrics).length == 0) {
                return null;
            }
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let serverMetricsResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(serverMetricsData));
            if (serverMetricsResult.message.statusCode != 200 && serverMetricsResult.message.statusCode != 201) {
                let errorObj = yield Util.getResultObj(serverMetricsResult);
                console.log(errorObj ? errorObj : Util.errorCorrection(serverMetricsResult));
                throw new Error("Error in updating server metrics");
            }
            let serverComponentsObj = yield Util.getResultObj(serverMetricsResult);
            return serverComponentsObj;
        });
    }
    createTestRun(startData) {
        return __awaiter(this, void 0, void 0, function* () {
            const testRunId = startData.testRunId;
            let urlSuffix = "test-runs/" + testRunId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            console.log("Creating and running a testRun for the test");
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.patch);
            let startTestresult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.patch, 3, JSON.stringify(startData));
            let testRunResp = yield Util.getResultObj(startTestresult);
            if (startTestresult.message.statusCode != 200 && startTestresult.message.statusCode != 201 || (0, util_1.isNullOrUndefined)(testRunResp)) {
                console.log(testRunResp ? testRunResp : Util.errorCorrection(startTestresult));
                throw new Error("Error in running the test");
            }
            return testRunResp;
        });
    }
    getTestRunAPI(testRunId) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "test-runs/" + testRunId + "?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, this.baseURL);
            let header = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let testRunResult = yield FetchUtil.httpClientRetries(url.toString(), header, UtilModels_1.FetchCallType.get, 3, "");
            let testRunObj = yield Util.getResultObj(testRunResult);
            if (testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201) {
                console.log(testRunObj ? testRunObj : Util.errorCorrection(testRunResult));
                throw new Error("Error in getting the test run");
            }
            return testRunObj;
        });
    }
    // only used in post process and we dont care about the error or any, we just send stop signal and exit the task, this is when pipeline is cancelled.
    stopTestRun(baseUri, testRunId) {
        return __awaiter(this, void 0, void 0, function* () {
            let urlSuffix = "test-runs/" + testRunId + ":stop?api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
            let url = new URL(urlSuffix, baseUri);
            let headers = yield this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.post);
            yield FetchUtil.httpClientRetries(url.toString(), headers, UtilModels_1.FetchCallType.post, 3, '');
        });
    }
}
exports.APIService = APIService;
