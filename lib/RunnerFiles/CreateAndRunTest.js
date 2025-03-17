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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.CreateAndRunTest = void 0;
const util_1 = require("util");
const PayloadModels_1 = require("../models/PayloadModels");
const LoadtestConfigUtil_1 = require("../Utils/LoadtestConfigUtil");
const CreateAndRunUtils_1 = require("../Utils/CreateAndRunUtils");
const UtilModels_1 = require("../models/UtilModels");
const TestKind_1 = require("../models/TestKind");
const Util = __importStar(require("../Utils/CommonUtils"));
const CoreUtils = __importStar(require("../Utils/CoreUtils"));
const FileUtils = __importStar(require("../Utils/FileUtils"));
const FetchUtil = __importStar(require("../Utils/FetchUtils"));
class CreateAndRunTest {
    constructor(apiService) {
        this.loadTestConfig = {};
        this.isCreateTest = true;
        this.existingTestObj = null;
        this.existingParams = { secrets: {}, env: {}, passFailCriteria: {}, passFailServerMetrics: {}, appComponents: new Map() };
        this.apiService = apiService;
    }
    createAndRunTest() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            yield this.initialize();
            let testPayload = yield this.getTestPayload();
            if (this.isCreateTest) {
                console.log("Creating a new load test " + this.loadTestConfig.testId);
            }
            let createdTestObj = yield this.apiService.createTestAPI(testPayload);
            this.isCreateTest ? console.log(`Created test with id ${createdTestObj.testId}`) : console.log("Test '" + createdTestObj.testId + "' already exists");
            let testFiles = createdTestObj.inputArtifacts;
            let filesToDelete = testFiles ? (0, CreateAndRunUtils_1.getAllFileNamesTobeDeleted)(this.loadTestConfig, testFiles) : [];
            if (filesToDelete.length > 0) {
                console.log(`Deleting ${filesToDelete.length} existing test file(s) which is(are) not in the configuration yaml file.`);
            }
            for (const file of filesToDelete) {
                yield this.apiService.deleteFileAPI(file);
            }
            yield this.uploadAllTestFiles(this.loadTestConfig, this.apiService);
            let validatedTest = yield this.awaitTerminationForFileValidation(this.apiService);
            this.checkForValidationsOfTest(validatedTest);
            let appComponentsPayload = yield this.getAppComponentsPayload();
            let appComponentsResp = yield this.apiService.patchAppComponents(appComponentsPayload);
            appComponentsResp && console.log("Updated app components successfully");
            let serverMetricsConfigPayload = yield this.getServerMetricsConfigPayload();
            yield this.apiService.patchServerMetricsConfig(serverMetricsConfigPayload);
            serverMetricsConfigPayload && console.log("Updated server metrics successfully");
            console.log("Creating and running a testRun for the test");
            let testRunPayload = yield this.getTestRunPayload();
            let testRunResult = yield this.apiService.createTestRun(testRunPayload);
            this.printPortalUrl(testRunResult);
            CoreUtils.exportVariable(UtilModels_1.PostTaskParameters.runId, testRunResult.testRunId);
            yield this.awaitTerminationForTestRun(testRunResult.testRunId, this.apiService);
            testRunResult = (_a = yield this.awaitResultsPopulation(testRunResult.testRunId, this.apiService)) !== null && _a !== void 0 ? _a : testRunResult;
            CoreUtils.exportVariable(UtilModels_1.PostTaskParameters.isRunCompleted, 'true');
            this.printMetrics(testRunResult);
            yield this.uploadResultsToPipeline(testRunResult);
            this.setTaskResults(testRunResult);
            this.setOutputVariable(testRunResult);
        });
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            this.loadTestConfig = LoadtestConfigUtil_1.LoadtestConfigUtil.parseLoadtestConfigFile();
            (0, CreateAndRunUtils_1.validateAndSetOverrideParams)(this.loadTestConfig);
            this.apiService.setTestId(this.loadTestConfig.testId);
            this.existingTestObj = yield this.apiService.getTestAPI(true);
            if (this.existingTestObj) {
                this.isCreateTest = false;
            }
            else {
                this.isCreateTest = true;
            }
        });
    }
    // Marked public for testing
    getTestPayload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isCreateTest) {
                this.existingTestObj && (0, CreateAndRunUtils_1.addExistingTestParameters)(this.existingTestObj, this.existingParams);
            }
            return (0, CreateAndRunUtils_1.getPayloadForTest)(this.loadTestConfig, this.existingParams);
        });
    }
    getAppComponentsPayload() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isCreateTest) {
                let appComponentsObj = yield this.apiService.getAppComponents();
                (0, CreateAndRunUtils_1.addExistingAppComponentParameters)(appComponentsObj, this.existingParams);
            }
            return (0, CreateAndRunUtils_1.getPayloadForAppcomponents)(this.loadTestConfig, this.existingParams);
        });
    }
    getServerMetricsConfigPayload() {
        return __awaiter(this, void 0, void 0, function* () {
            let existingServerMetricsConfig = null;
            if (!this.isCreateTest) {
                existingServerMetricsConfig = yield this.apiService.getServerMetricsConfig();
            }
            return (0, CreateAndRunUtils_1.getPayloadForServerMetricsConfig)(existingServerMetricsConfig, this.loadTestConfig);
        });
    }
    getTestRunPayload() {
        return __awaiter(this, void 0, void 0, function* () {
            let runTimeParamsofTestRun = (0, CreateAndRunUtils_1.validateAndGetRunTimeParamsForTestRun)(this.loadTestConfig.testId);
            return (0, CreateAndRunUtils_1.getTestRunPayload)(runTimeParamsofTestRun);
        });
    }
    /*
    * This function will wait for the validation of files to complete
    */
    awaitTerminationForFileValidation(apiService) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let minutesToAdd = 10;
            let startTime = new Date();
            let maxAllowedTime = new Date(startTime.getTime() + minutesToAdd * 60000);
            let validationStatus = PayloadModels_1.FileStatus.VALIDATION_INITIATED;
            let testObj = null;
            let retry = 5;
            while (maxAllowedTime > (new Date()) && !Util.isTerminalFileStatus(validationStatus)) {
                yield Util.sleep(5000);
                try {
                    testObj = yield apiService.getTestAPI();
                    let inputScriptFileInfo;
                    testObj && (inputScriptFileInfo = testObj.kind == TestKind_1.TestKind.URL ? (_a = testObj.inputArtifacts) === null || _a === void 0 ? void 0 : _a.urlTestConfigFileInfo : (_b = testObj.inputArtifacts) === null || _b === void 0 ? void 0 : _b.testScriptFileInfo);
                    validationStatus = (_c = inputScriptFileInfo === null || inputScriptFileInfo === void 0 ? void 0 : inputScriptFileInfo.validationStatus) !== null && _c !== void 0 ? _c : validationStatus;
                }
                catch (e) {
                    retry--;
                    if (retry == 0) {
                        throw new Error("Unable to validate the test plan. Please retry. Failed with error :" + e);
                    }
                }
            }
            return testObj;
        });
    }
    /*
    * This function will wait for the test run to complete
    */
    awaitTerminationForTestRun(id, apiService) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let testRunStatus = "ACCEPTED";
            let testRunObj = null;
            while (!Util.isTerminalTestStatus(testRunStatus)) {
                if (testRunStatus === "DEPROVISIONING" || testRunStatus === "DEPROVISIONED" || testRunStatus == "EXECUTED")
                    yield Util.sleep(5000);
                else
                    yield Util.sleep(20000);
                testRunObj = yield apiService.getTestRunAPI(id);
                testRunStatus = (_a = testRunObj.status) !== null && _a !== void 0 ? _a : testRunStatus;
            }
            return testRunObj;
        });
    }
    // Marked public for testing
    awaitResultsPopulation(testRunId, apiService) {
        return __awaiter(this, void 0, void 0, function* () {
            let vusers = null;
            let count = 0;
            let reportsAvailable = false;
            let testRunObj = null;
            console.log("Test run completed. Polling for statistics and dashboard report to populate.");
            // Polling for max 5 min for statistics and pass fail criteria to populate
            while ((!reportsAvailable || (0, util_1.isNullOrUndefined)(vusers)) && count < 30) {
                yield Util.sleep(10000);
                testRunObj = yield apiService.getTestRunAPI(testRunId);
                vusers = testRunObj.virtualUsers;
                count++;
                let testReport = Util.getReportFolder(testRunObj.testArtifacts);
                if (testReport) {
                    reportsAvailable = true;
                }
            }
            return testRunObj;
        });
    }
    uploadAllTestFiles(loadTestConfig, apiService) {
        return __awaiter(this, void 0, void 0, function* () {
            let configFiles = loadTestConfig.configurationFiles;
            if (configFiles.length > 0) {
                console.log("Uploading the configuration files");
                yield this.uploadFiles(configFiles, apiService, PayloadModels_1.FileType.ADDITIONAL_ARTIFACTS);
                console.log(`Uploaded ${configFiles.length} configuration file(s) for the test successfully.`);
            }
            let zipFiles = loadTestConfig.zipArtifacts;
            if (zipFiles.length > 0) {
                console.log("Uploading the zip artifacts");
                yield this.uploadFiles(zipFiles, apiService, PayloadModels_1.FileType.ZIPPED_ARTIFACTS);
                console.log(`Uploaded ${zipFiles.length} zip artifact(s) for the test successfully.`);
            }
            let propertyFile = loadTestConfig.propertyFile;
            if (propertyFile != undefined && propertyFile != '') {
                console.log("Uploading the user properties file");
                yield apiService.uploadFile(propertyFile, PayloadModels_1.FileType.USER_PROPERTIES);
                console.log(`Uploaded user properties file for the test successfully.`);
            }
            yield this.uploadTestScriptFile(loadTestConfig, apiService);
        });
    }
    uploadFiles(configFiles, apiService, fileType) {
        return __awaiter(this, void 0, void 0, function* () {
            if (configFiles.length > 0) {
                for (let filepath of configFiles) {
                    yield apiService.uploadFile(filepath, fileType);
                }
                ;
            }
        });
    }
    uploadTestScriptFile(loadTestConfig, apiService) {
        return __awaiter(this, void 0, void 0, function* () {
            let testScriptFile = loadTestConfig.testPlan;
            let fileType = PayloadModels_1.FileType.TEST_SCRIPT;
            if (loadTestConfig.kind == TestKind_1.TestKind.URL) {
                fileType = PayloadModels_1.FileType.URL_TEST_CONFIG;
            }
            console.log("Uploading the test script file");
            yield apiService.uploadFile(testScriptFile, fileType);
            console.log(`Uploaded test script file for the test successfully.`);
        });
    }
    printPortalUrl(testRunObj) {
        let resourceId = this.apiService.authContext.taskParameters.resourceId;
        let subscriptionName = this.apiService.authContext.taskParameters.subscriptionName;
        let testDisplayName = this.loadTestConfig.displayName;
        console.log("\nView the load test run in Azure portal by following the steps:");
        console.log("1. Go to your Azure Load Testing resource '" + Util.getResourceNameFromResourceId(resourceId) + "' in subscription '" + subscriptionName + "'");
        console.log("2. On the Tests page, go to test '" + testDisplayName + "'");
        console.log("3. Go to test run '" + testRunObj.displayName + "'\n");
    }
    checkForValidationsOfTest(testObj) {
        var _a, _b, _c;
        let validationStatus = (_c = (_b = (_a = testObj.inputArtifacts) === null || _a === void 0 ? void 0 : _a.testScriptFileInfo) === null || _b === void 0 ? void 0 : _b.validationStatus) !== null && _c !== void 0 ? _c : PayloadModels_1.FileStatus.VALIDATION_INITIATED;
        console.log("Validation status of the test plan: " + validationStatus);
        if (Util.isTerminalFileStatusSucceeded(validationStatus)) {
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
        else if (!Util.isTerminalFileStatus(validationStatus)) {
            throw new Error("TestPlan validation timeout. Please try again.");
        }
        else {
            throw new Error("TestPlan validation Failed.");
        }
    }
    printMetrics(testRunObj) {
        Util.printTestDuration(testRunObj);
        if (!(0, util_1.isNullOrUndefined)(testRunObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testRunObj.passFailCriteria.passFailMetrics))
            Util.printCriteria(testRunObj.passFailCriteria.passFailMetrics);
        if (testRunObj.testRunStatistics != null && testRunObj.testRunStatistics != undefined)
            Util.printClientMetrics(testRunObj.testRunStatistics);
    }
    uploadResultsToPipeline(testRunObj) {
        return __awaiter(this, void 0, void 0, function* () {
            let testResultUrl = Util.getResultFolder(testRunObj.testArtifacts);
            if (testResultUrl != null) {
                const response = yield FetchUtil.httpClientRetries(testResultUrl, {}, UtilModels_1.FetchCallType.get, 3, "");
                if (response.message.statusCode != 200) {
                    let respObj = yield Util.getResultObj(response);
                    console.log(respObj ? respObj : Util.errorCorrection(response));
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
                    console.log(respObj ? respObj : Util.errorCorrection(response));
                    throw new Error("Error in fetching report ");
                }
                else {
                    yield FileUtils.uploadFileToResultsFolder(response, UtilModels_1.reportZipFileName);
                }
            }
        });
    }
    setTaskResults(testRunObj) {
        if (!(0, util_1.isNullOrUndefined)(testRunObj.testResult) && Util.isStatusFailed(testRunObj.testResult)) {
            CoreUtils.setFailed("TestResult: " + testRunObj.testResult);
        }
        if (!(0, util_1.isNullOrUndefined)(testRunObj.status) && Util.isStatusFailed(testRunObj.status)) {
            console.log("Please go to the Portal for more error details: " + testRunObj.portalUrl);
            CoreUtils.setFailed("TestStatus: " + testRunObj.status);
        }
    }
    setOutputVariable(testRunObj) {
        let outputVarName = (0, CreateAndRunUtils_1.validateAndGetOutPutVarName)();
        let outputVar = {
            testRunId: testRunObj.testRunId
        };
        CoreUtils.setOutput(`${outputVarName}.${UtilModels_1.OutPutVariablesConstants.testRunId}`, outputVar.testRunId);
    }
}
exports.CreateAndRunTest = CreateAndRunTest;
