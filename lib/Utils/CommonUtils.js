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
exports.getAllFileErrors = exports.validateTestRunParamsFromPipeline = exports.getDefaultRunDescription = exports.getDefaultTestRunName = exports.getDefaultTestName = exports.inValidEngineInstances = exports.invalidName = exports.validateUrlcert = exports.validateUrl = exports.validateOutputParametervariableName = exports.validateOverRideParameters = exports.validateAndGetSegregatedManagedIdentities = exports.validateAutoStop = exports.getSubscriptionIdFromResourceId = exports.getResourceGroupFromResourceId = exports.getResourceNameFromResourceId = exports.getResourceTypeFromResourceId = exports.invalidDescription = exports.invalidDisplayName = exports.getFileName = exports.getResultObj = exports.isStatusFailed = exports.isTerminalFileStatusSucceeded = exports.isTerminalFileStatus = exports.isTerminalTestStatus = exports.removeUnits = exports.indexOfFirstDigit = exports.getReportFolder = exports.getResultFolder = exports.getUniqueId = exports.sleep = exports.printClientMetrics = exports.errorCorrection = exports.printCriteria = exports.printTestDuration = exports.checkFileTypes = exports.checkFileType = void 0;
const { v4: uuidv4 } = require('uuid');
const util_1 = require("util");
const GeneralConstants_1 = require("../Constants/GeneralConstants");
const PayloadModels_1 = require("../models/PayloadModels");
const UtilModels_1 = require("../models/UtilModels");
const InputConstants = __importStar(require("../Constants/InputConstants"));
const path = __importStar(require("path"));
function checkFileType(filePath, fileExtToValidate) {
    if ((0, util_1.isNullOrUndefined)(filePath)) {
        return false;
    }
    let split = filePath.split('.');
    return split[split.length - 1].toLowerCase() == fileExtToValidate.toLowerCase();
}
exports.checkFileType = checkFileType;
function checkFileTypes(filePath, fileExtsToValidate) {
    var _a;
    if ((0, util_1.isNullOrUndefined)(filePath)) {
        return false;
    }
    let split = filePath.split('.');
    let fileExtsToValidateLower = fileExtsToValidate.map(ext => ext.toLowerCase());
    return fileExtsToValidateLower.includes((_a = split[split.length - 1]) === null || _a === void 0 ? void 0 : _a.toLowerCase());
}
exports.checkFileTypes = checkFileTypes;
function printTestDuration(testRunObj) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Summary generation completed\n");
        console.log("-------------------Summary ---------------");
        console.log("TestRun start time: " + new Date((_a = testRunObj.startDateTime) !== null && _a !== void 0 ? _a : new Date()));
        console.log("TestRun end time: " + new Date((_b = testRunObj.endDateTime) !== null && _b !== void 0 ? _b : new Date()));
        console.log("Virtual Users: " + testRunObj.virtualUsers);
        console.log("TestStatus: " + testRunObj.status + "\n");
        return;
    });
}
exports.printTestDuration = printTestDuration;
function printCriteria(criteria) {
    if (Object.keys(criteria).length == 0)
        return;
    printTestResult(criteria);
    console.log("Criteria\t\t\t\t\t :Actual Value\t      Result");
    for (var key in criteria) {
        let metric = criteria[key];
        if ((0, util_1.isNullOrUndefined)(metric))
            continue;
        var str = metric.aggregate + "(" + metric.clientMetric + ") " + metric.condition + ' ' + metric.value;
        if (metric.requestName != null) {
            str = metric.requestName + ": " + str;
        }
        //str += ((metric.clientmetric == "error") ? ", " : "ms, ") + metric.action;
        var spaceCount = 50 - str.length;
        while (spaceCount > 0) {
            str += ' ';
            spaceCount--;
        }
        var actualValue = metric.actualValue ? metric.actualValue.toString() : '';
        spaceCount = 10 - (actualValue).length;
        while (spaceCount--)
            actualValue = actualValue + ' ';
        metric.result = metric.result ? metric.result.toUpperCase() : '';
        console.log(str + actualValue + "            " + metric.result);
    }
    console.log("\n");
}
exports.printCriteria = printCriteria;
function errorCorrection(result) {
    return "Unable to fetch the response. Please re-run or contact support if the issue persists. " + "Status code :" + result.message.statusCode;
}
exports.errorCorrection = errorCorrection;
function printTestResult(criteria) {
    var _a, _b;
    let pass = 0;
    let fail = 0;
    for (var key in criteria) {
        if (((_a = criteria[key]) === null || _a === void 0 ? void 0 : _a.result) == "passed")
            pass++;
        else if (((_b = criteria[key]) === null || _b === void 0 ? void 0 : _b.result) == "failed")
            fail++;
    }
    console.log("-------------------Test Criteria ---------------");
    console.log("Results\t\t\t :" + pass + " Pass " + fail + " Fail\n");
    return { pass, fail }; // returning so that we can use this in the UTs later.
}
function printMetrics(data, key = null) {
    var _a;
    let samplerName = (_a = data.transaction) !== null && _a !== void 0 ? _a : key;
    if (samplerName == 'Total') {
        samplerName = "Aggregate";
    }
    console.log("Sampler name \t\t : ", samplerName, "\n");
    console.log("response time \t\t : avg=" + getAbsVal(data.meanResTime) + " ms, min=" + getAbsVal(data.minResTime) + " ms, med=" + getAbsVal(data.medianResTime) + " ms, max=" + getAbsVal(data.maxResTime) + " ms, p(75)=" + getAbsVal(data.pct75ResTime) + " ms, p(90)=" + getAbsVal(data.pct1ResTime) + " ms, p(95)=" + getAbsVal(data.pct2ResTime) + " ms, p(96)=" + getAbsVal(data.pct96ResTime) + " ms, p(98)=" + getAbsVal(data.pct98ResTime) + " ms, p(99)=" + getAbsVal(data.pct3ResTime) + " ms, p(99.9)=" + getAbsVal(data.pct999ResTime) + " ms, p(99.99)=" + getAbsVal(data.pct9999ResTime));
    console.log("requests per sec \t : avg=" + getAbsVal(data.throughput));
    console.log("total requests \t\t : " + data.sampleCount);
    console.log("total errors \t\t : " + data.errorCount);
    console.log("total error rate \t : " + data.errorPct);
    console.log("\n");
}
function printClientMetrics(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Object.keys(obj).length == 0)
            return;
        console.log("------------------Client-side metrics------------\n");
        for (var key in obj) {
            printMetrics(obj[key], key);
        }
    });
}
exports.printClientMetrics = printClientMetrics;
function getAbsVal(data) {
    if ((0, util_1.isNullOrUndefined)(data)) {
        return "undefined";
    }
    let dataString = data.toString();
    let dataArray = dataString.split('.');
    return dataArray[0];
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
exports.sleep = sleep;
function getUniqueId() {
    return uuidv4();
}
exports.getUniqueId = getUniqueId;
function getResultFolder(testArtifacts) {
    if ((0, util_1.isNullOrUndefined)(testArtifacts) || (0, util_1.isNullOrUndefined)(testArtifacts.outputArtifacts))
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return !(0, util_1.isNullOrUndefined)(outputurl.resultFileInfo) ? outputurl.resultFileInfo.url : null;
}
exports.getResultFolder = getResultFolder;
function getReportFolder(testArtifacts) {
    if ((0, util_1.isNullOrUndefined)(testArtifacts) || (0, util_1.isNullOrUndefined)(testArtifacts.outputArtifacts))
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return !(0, util_1.isNullOrUndefined)(outputurl.reportFileInfo) ? outputurl.reportFileInfo.url : null;
}
exports.getReportFolder = getReportFolder;
function indexOfFirstDigit(input) {
    let i = 0;
    for (; input[i] < '0' || input[i] > '9'; i++)
        ;
    return i == input.length ? -1 : i;
}
exports.indexOfFirstDigit = indexOfFirstDigit;
function removeUnits(input) {
    let i = 0;
    for (; input[i] >= '0' && input[i] <= '9'; i++)
        ;
    return i == input.length ? input : input.substring(0, i);
}
exports.removeUnits = removeUnits;
function isTerminalTestStatus(testStatus) {
    if (testStatus == "DONE" || testStatus === "FAILED" || testStatus === "CANCELLED") {
        return true;
    }
    return false;
}
exports.isTerminalTestStatus = isTerminalTestStatus;
function isTerminalFileStatus(fileStatus) {
    let fileStatusEnum = fileStatus;
    if (fileStatusEnum == PayloadModels_1.FileStatus.VALIDATION_INITIATED) {
        return false;
    }
    return true;
}
exports.isTerminalFileStatus = isTerminalFileStatus;
function isTerminalFileStatusSucceeded(fileStatus) {
    let fileStatusEnum = fileStatus;
    if ((0, util_1.isNullOrUndefined)(fileStatusEnum) || fileStatusEnum == PayloadModels_1.FileStatus.VALIDATION_SUCCESS || fileStatusEnum == PayloadModels_1.FileStatus.NOT_VALIDATED) {
        return true;
    }
    return false;
}
exports.isTerminalFileStatusSucceeded = isTerminalFileStatusSucceeded;
function isStatusFailed(testStatus) {
    if (testStatus === "FAILED" || testStatus === "CANCELLED") {
        return true;
    }
    return false;
}
exports.isStatusFailed = isStatusFailed;
function getResultObj(data) {
    return __awaiter(this, void 0, void 0, function* () {
        let dataString;
        let dataJSON;
        try {
            dataString = yield data.readBody();
            dataJSON = JSON.parse(dataString);
            return dataJSON;
        }
        catch (_a) {
            return null;
        }
    });
}
exports.getResultObj = getResultObj;
function getFileName(filepath) {
    const filename = path.basename(filepath);
    return filename;
}
exports.getFileName = getFileName;
function invalidDisplayName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    return false;
}
exports.invalidDisplayName = invalidDisplayName;
function invalidDescription(value) {
    if (value.length > 100)
        return true;
    return false;
}
exports.invalidDescription = invalidDescription;
function getResourceTypeFromResourceId(resourceId) {
    return resourceId && resourceId.split("/").length > 7 ? resourceId.split("/")[6] + "/" + resourceId.split("/")[7] : null;
}
exports.getResourceTypeFromResourceId = getResourceTypeFromResourceId;
function getResourceNameFromResourceId(resourceId) {
    return resourceId && resourceId.split("/").length > 8 ? resourceId.split("/")[8] : null;
}
exports.getResourceNameFromResourceId = getResourceNameFromResourceId;
function getResourceGroupFromResourceId(resourceId) {
    return resourceId && resourceId.split("/").length > 4 ? resourceId.split("/")[4] : null;
}
exports.getResourceGroupFromResourceId = getResourceGroupFromResourceId;
function getSubscriptionIdFromResourceId(resourceId) {
    return resourceId && resourceId.split("/").length > 2 ? resourceId.split("/")[2] : null;
}
exports.getSubscriptionIdFromResourceId = getSubscriptionIdFromResourceId;
function validateAutoStop(autoStop, isPipelineParam = false) {
    if (typeof autoStop != 'string') {
        if ((0, util_1.isNullOrUndefined)(autoStop.errorPercentage) || isNaN(autoStop.errorPercentage) || autoStop.errorPercentage > 100 || autoStop.errorPercentage < 0) {
            let errorMessage = isPipelineParam
                ? `The value "${autoStop.errorPercentage}" for errorPercentage of auto-stop criteria is invalid in the overrideParameters provided. The value should be valid decimal number from 0 to 100.`
                : `The value "${autoStop.errorPercentage}" for errorPercentage of auto-stop criteria is invalid. The value should be valid decimal number from 0 to 100.`;
            return { valid: false, error: errorMessage };
        }
        if ((0, util_1.isNullOrUndefined)(autoStop.timeWindow) || isNaN(autoStop.timeWindow) || autoStop.timeWindow <= 0 || !Number.isInteger(autoStop.timeWindow)) {
            let errorMessage = isPipelineParam
                ? `The value "${autoStop.timeWindow}" for timeWindow of auto-stop criteria is invalid in the overrideParameters provided. The value should be valid integer greater than 0.`
                : `The value "${autoStop.timeWindow}" for timeWindow of auto-stop criteria is invalid. The value should be valid integer greater than 0.`;
            return { valid: false, error: errorMessage };
        }
    }
    else if (autoStop != GeneralConstants_1.autoStopDisable) {
        let errorMessage = isPipelineParam
            ? 'Invalid value for "autoStop" in the overrideParameters provided, for disabling auto stop use "autoStop: disable"'
            : 'Invalid value for "autoStop", for disabling auto stop use "autoStop: disable"';
        return { valid: false, error: errorMessage };
    }
    return { valid: true, error: "" };
}
exports.validateAutoStop = validateAutoStop;
function validateAndGetSegregatedManagedIdentities(referenceIdentities, keyVaultGivenOutOfReferenceIdentities = false) {
    let referenceIdentityValuesUAMIMap = {
        [UtilModels_1.ReferenceIdentityKinds.KeyVault]: [],
        [UtilModels_1.ReferenceIdentityKinds.Metrics]: [],
        [UtilModels_1.ReferenceIdentityKinds.Engine]: []
    };
    let referenceIdentiesSystemAssignedCount = {
        [UtilModels_1.ReferenceIdentityKinds.KeyVault]: 0,
        [UtilModels_1.ReferenceIdentityKinds.Metrics]: 0,
        [UtilModels_1.ReferenceIdentityKinds.Engine]: 0
    };
    for (let referenceIdentity of referenceIdentities) {
        // the value has check proper check in the utils, so we can decide the Type based on the value.
        if (referenceIdentity.value) {
            referenceIdentityValuesUAMIMap[referenceIdentity.kind].push(referenceIdentity.value);
        }
        else {
            referenceIdentiesSystemAssignedCount[referenceIdentity.kind]++;
        }
    }
    // key-vault which needs back-compat.
    if (keyVaultGivenOutOfReferenceIdentities) {
        if (referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault].length > 0 || referenceIdentiesSystemAssignedCount[UtilModels_1.ReferenceIdentityKinds.KeyVault] > 0) {
            throw new Error("Two KeyVault references are defined in the YAML config file. Use either the keyVaultReferenceIdentity field or the referenceIdentities section to specify the KeyVault reference identity.");
        }
        // this will be assigned above if the given is outside the refIds so no need to assign again.
    }
    for (let key in UtilModels_1.ReferenceIdentityKinds) {
        if (key != UtilModels_1.ReferenceIdentityKinds.Engine) {
            if (referenceIdentityValuesUAMIMap[key].length > 1 || referenceIdentiesSystemAssignedCount[key] > 1) {
                throw new Error(`Only one ${key} reference identity should be provided in the referenceIdentities array.`);
            }
            else if (referenceIdentityValuesUAMIMap[key].length == 1 && referenceIdentiesSystemAssignedCount[key] > 0) {
                throw new Error(`${key} reference identity should be either SystemAssigned or UserAssigned but not both.`);
            }
        }
    }
    // engines check, this can have multiple values too check is completely different.
    if (referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Engine].length > 0 && referenceIdentiesSystemAssignedCount[UtilModels_1.ReferenceIdentityKinds.Engine] > 0) {
        throw new Error("Engine reference identity should be either SystemAssigned or UserAssigned but not both.");
    }
    else if (referenceIdentiesSystemAssignedCount[UtilModels_1.ReferenceIdentityKinds.Engine] > 1) {
        throw new Error("Only one Engine reference identity with SystemAssigned should be provided in the referenceIdentities array.");
    }
    return { referenceIdentityValuesUAMIMap, referenceIdentiesSystemAssignedCount };
}
exports.validateAndGetSegregatedManagedIdentities = validateAndGetSegregatedManagedIdentities;
function validateOverRideParameters(overRideParams) {
    try {
        if (!(0, util_1.isNullOrUndefined)(overRideParams)) {
            let overRideParamsObj;
            try {
                overRideParamsObj = JSON.parse(overRideParams);
            }
            catch (error) {
                return { valid: false, error: `Invalid format provided in the ${InputConstants.overRideParametersLabel} field in pipeline, provide a valid json string.` };
            }
            ;
            let unSupportedKeys = [];
            let supportedKeys = Object.keys(new GeneralConstants_1.OverRideParametersModel());
            Object.keys(overRideParamsObj).forEach(element => {
                if (supportedKeys.indexOf(element) == -1) {
                    unSupportedKeys.push(element);
                }
            });
            if (unSupportedKeys.length) {
                const result = unSupportedKeys.map(element => `${element}`).join(", ");
                return { valid: false, error: `The ${InputConstants.overRideParametersLabel} provided has unsupported field(s) "${result}".` };
            }
            if (!(0, util_1.isNullOrUndefined)(overRideParamsObj.testId)) {
                if (typeof overRideParamsObj.testId != 'string' || invalidName(overRideParamsObj.testId.toLowerCase())) {
                    return { valid: false, error: `The value "${overRideParamsObj.testId}" for testId provided in overrideParameters is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.` };
                }
            }
            if (!(0, util_1.isNullOrUndefined)(overRideParamsObj.displayName)) {
                if (typeof overRideParamsObj.displayName != 'string' || invalidDisplayName(overRideParamsObj.displayName)) {
                    return { valid: false, error: `The value "${overRideParamsObj.displayName}" for displayName provided in overrideParameters is invalid. Display name must be a string of length between 2 to 50.` };
                }
            }
            if (!(0, util_1.isNullOrUndefined)(overRideParamsObj.description)) {
                if (typeof overRideParamsObj.description != 'string' || invalidDescription(overRideParamsObj.description)) {
                    return { valid: false, error: `The value "${overRideParamsObj.description}" for description provided in overrideParameters is invalid. Description must be a string of length less than 100.` };
                }
            }
            if (!(0, util_1.isNullOrUndefined)(overRideParamsObj.engineInstances)) {
                if (typeof overRideParamsObj.engineInstances != 'number' || inValidEngineInstances(overRideParamsObj.engineInstances)) {
                    return { valid: false, error: `The value "${overRideParamsObj.engineInstances}" for engineInstances provided in overrideParameters is invalid. The value should be an integer between 1 and 400.` };
                }
            }
            if (!(0, util_1.isNullOrUndefined)(overRideParamsObj.autoStop)) {
                let validation = validateAutoStop(overRideParamsObj.autoStop, true);
                if (validation.valid == false) {
                    return validation;
                }
            }
        }
    }
    catch (error) {
        return { valid: false, error: (error !== null && error !== void 0 ? error : '').toString() };
    }
    return { valid: true, error: "" };
}
exports.validateOverRideParameters = validateOverRideParameters;
function validateOutputParametervariableName(outputVarName) {
    if ((0, util_1.isNullOrUndefined)(outputVarName) || typeof outputVarName != 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(outputVarName)) {
        return { valid: false, error: `Invalid output variable name '${outputVarName}'. Use only letters, numbers, and underscores.` };
    }
    return { valid: true, error: "" };
}
exports.validateOutputParametervariableName = validateOutputParametervariableName;
function validateUrl(url) {
    var r = new RegExp(/(http|https):\/\/.*\/secrets\/.+$/);
    return r.test(url);
}
exports.validateUrl = validateUrl;
function validateUrlcert(url) {
    var r = new RegExp(/(http|https):\/\/.*\/certificates\/.+$/);
    return r.test(url);
}
exports.validateUrlcert = validateUrlcert;
function invalidName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    var r = new RegExp(/[^a-z0-9_-]+/);
    return r.test(value);
}
exports.invalidName = invalidName;
function inValidEngineInstances(engines) {
    if (engines > 400 || engines < 1) {
        return true;
    }
    return false;
}
exports.inValidEngineInstances = inValidEngineInstances;
function getDefaultTestName() {
    const a = (new Date(Date.now())).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "Test_" + b[0] + "_" + c[1] + c[2];
}
exports.getDefaultTestName = getDefaultTestName;
function getDefaultTestRunName() {
    const a = (new Date(Date.now())).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "TestRun_" + b[0] + "_" + c[1] + c[2];
}
exports.getDefaultTestRunName = getDefaultTestRunName;
function getDefaultRunDescription() {
    const pipelineName = process.env.GITHUB_WORKFLOW || "Unknown Pipeline";
    return "Started using GH workflows" + (pipelineName ? "-" + pipelineName : "");
}
exports.getDefaultRunDescription = getDefaultRunDescription;
function validateTestRunParamsFromPipeline(runTimeParams) {
    if (runTimeParams.runDisplayName && invalidDisplayName(runTimeParams.runDisplayName))
        throw new Error("Invalid test run name. Test run name must be between 2 to 50 characters.");
    if (runTimeParams.runDescription && invalidDescription(runTimeParams.runDescription))
        throw new Error("Invalid test run description. Test run description must be less than 100 characters.");
}
exports.validateTestRunParamsFromPipeline = validateTestRunParamsFromPipeline;
function getAllFileErrors(testObj) {
    var _a, _b, _c, _d, _e, _f;
    let allArtifacts = [];
    let additionalArtifacts = (_a = testObj === null || testObj === void 0 ? void 0 : testObj.inputArtifacts) === null || _a === void 0 ? void 0 : _a.additionalFileInfo;
    additionalArtifacts && (allArtifacts = allArtifacts.concat(additionalArtifacts.filter((artifact) => artifact !== null && artifact !== undefined)));
    let testScript = (_b = testObj === null || testObj === void 0 ? void 0 : testObj.inputArtifacts) === null || _b === void 0 ? void 0 : _b.testScriptFileInfo;
    testScript && allArtifacts.push(testScript);
    let configFile = (_c = testObj === null || testObj === void 0 ? void 0 : testObj.inputArtifacts) === null || _c === void 0 ? void 0 : _c.configFileInfo;
    configFile && allArtifacts.push(configFile);
    let userProperties = (_d = testObj === null || testObj === void 0 ? void 0 : testObj.inputArtifacts) === null || _d === void 0 ? void 0 : _d.userPropFileInfo;
    userProperties && allArtifacts.push(userProperties);
    let zipFile = (_e = testObj === null || testObj === void 0 ? void 0 : testObj.inputArtifacts) === null || _e === void 0 ? void 0 : _e.inputArtifactsZipFileInfo;
    zipFile && allArtifacts.push(zipFile);
    let urlFile = (_f = testObj === null || testObj === void 0 ? void 0 : testObj.inputArtifacts) === null || _f === void 0 ? void 0 : _f.urlTestConfigFileInfo;
    urlFile && allArtifacts.push(urlFile);
    let fileErrors = {};
    for (const file of allArtifacts) {
        if (file.validationStatus === "VALIDATION_FAILURE") {
            fileErrors[file.fileName] = file.validationFailureDetails;
        }
    }
    return fileErrors;
}
exports.getAllFileErrors = getAllFileErrors;
