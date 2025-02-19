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
exports.checkFileType = checkFileType;
exports.checkFileTypes = checkFileTypes;
exports.printTestDuration = printTestDuration;
exports.printCriteria = printCriteria;
exports.ErrorCorrection = ErrorCorrection;
exports.printClientMetrics = printClientMetrics;
exports.sleep = sleep;
exports.getUniqueId = getUniqueId;
exports.getResultFolder = getResultFolder;
exports.getReportFolder = getReportFolder;
exports.indexOfFirstDigit = indexOfFirstDigit;
exports.removeUnits = removeUnits;
exports.isTerminalTestStatus = isTerminalTestStatus;
exports.isStatusFailed = isStatusFailed;
exports.validCriteria = validCriteria;
exports.getResultObj = getResultObj;
exports.invalidDisplayName = invalidDisplayName;
exports.invalidDescription = invalidDescription;
exports.checkValidityYaml = checkValidityYaml;
exports.getPassFailCriteriaFromString = getPassFailCriteriaFromString;
exports.ValidateCriteriaAndConvertToWorkingStringModel = ValidateCriteriaAndConvertToWorkingStringModel;
exports.validateUrl = validateUrl;
exports.validateUrlcert = validateUrlcert;
exports.getDefaultTestName = getDefaultTestName;
exports.getDefaultTestRunName = getDefaultTestRunName;
exports.getDefaultRunDescription = getDefaultRunDescription;
exports.validateTestRunParamsFromPipeline = validateTestRunParamsFromPipeline;
exports.getAllFileErrors = getAllFileErrors;
const { v4: uuidv4 } = require('uuid');
const util_1 = require("util");
const constants_1 = require("./constants");
const EngineUtil = __importStar(require("./engine/Util"));
const TestKind_1 = require("./engine/TestKind");
const UtilModels_1 = require("./UtilModels");
function checkFileType(filePath, fileExtToValidate) {
    if ((0, util_1.isNullOrUndefined)(filePath)) {
        return false;
    }
    let split = filePath.split('.');
    return split[split.length - 1].toLowerCase() == fileExtToValidate.toLowerCase();
}
function checkFileTypes(filePath, fileExtsToValidate) {
    var _a;
    if ((0, util_1.isNullOrUndefined)(filePath)) {
        return false;
    }
    let split = filePath.split('.');
    let fileExtsToValidateLower = fileExtsToValidate.map(ext => ext.toLowerCase());
    return fileExtsToValidateLower.includes((_a = split[split.length - 1]) === null || _a === void 0 ? void 0 : _a.toLowerCase());
}
function printTestDuration(testRunObj) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("Summary generation completed\n");
        console.log("-------------------Summary ---------------");
        console.log("TestRun start time: " + new Date((_a = testRunObj.startDateTime) !== null && _a !== void 0 ? _a : new Date()));
        console.log("TestRun end time: " + new Date((_b = testRunObj.endDateTime) !== null && _b !== void 0 ? _b : new Date()));
        console.log("Virtual Users: " + testRunObj.virtualUsers);
        console.log("TestStatus: " + testRunObj.status + "\n");
        return;
    });
}
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
function ErrorCorrection(result) {
    return "Unable to fetch the response. Please re-run or contact support if the issue persists. " + "Status code :" + result.message.statusCode;
}
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
function getUniqueId() {
    return uuidv4();
}
function getResultFolder(testArtifacts) {
    if ((0, util_1.isNullOrUndefined)(testArtifacts) || (0, util_1.isNullOrUndefined)(testArtifacts.outputArtifacts))
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return !(0, util_1.isNullOrUndefined)(outputurl.resultFileInfo) ? outputurl.resultFileInfo.url : null;
}
function getReportFolder(testArtifacts) {
    if ((0, util_1.isNullOrUndefined)(testArtifacts) || (0, util_1.isNullOrUndefined)(testArtifacts.outputArtifacts))
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return !(0, util_1.isNullOrUndefined)(outputurl.reportFileInfo) ? outputurl.reportFileInfo.url : null;
}
function indexOfFirstDigit(input) {
    let i = 0;
    for (; input[i] < '0' || input[i] > '9'; i++)
        ;
    return i == input.length ? -1 : i;
}
function removeUnits(input) {
    let i = 0;
    for (; input[i] >= '0' && input[i] <= '9'; i++)
        ;
    return i == input.length ? input : input.substring(0, i);
}
function isTerminalTestStatus(testStatus) {
    if (testStatus == "DONE" || testStatus === "FAILED" || testStatus === "CANCELLED") {
        return true;
    }
    return false;
}
function isStatusFailed(testStatus) {
    if (testStatus === "FAILED" || testStatus === "CANCELLED") {
        return true;
    }
    return false;
}
function validCriteria(data) {
    switch (data.clientMetric) {
        case "response_time_ms":
            return validResponseTimeCriteria(data);
        case "requests_per_sec":
            return validRequestsPerSecondCriteria(data);
        case "requests":
            return validRequestsCriteria(data);
        case "latency":
            return validLatencyCriteria(data);
        case "error":
            return validErrorCriteria(data);
        default:
            return false;
    }
}
function validResponseTimeCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['response_time_ms'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['response_time_ms'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validRequestsPerSecondCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['requests_per_sec'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['requests_per_sec'].includes(data.condition)
        || data.action != "continue");
}
function validRequestsCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['requests'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['requests'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validLatencyCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['latency'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['latency'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validErrorCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['error'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['error'].includes(data.condition)
        || Number(data.value) < 0 || Number(data.value) > 100 || data.action != "continue");
}
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
function isDictionary(variable) {
    return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}
function invalidName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    var r = new RegExp(/[^a-z0-9_-]+/);
    return r.test(value);
}
function invalidDisplayName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    return false;
}
function invalidDescription(value) {
    if (value.length > 100)
        return true;
    return false;
}
function isInValidSubnet(uri) {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.Network\/virtualNetworks\/[a-zA-Z0-9._-]+\/subnets\/[a-zA-Z0-9._-]+$/i;
    return !(pattern.test(uri));
}
function isInValidKVId(uri) {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.ManagedIdentity\/userAssignedIdentities\/[a-zA-Z0-9._-]+$/i;
    return !(pattern.test(uri));
}
function isValidTestKind(value) {
    return Object.values(TestKind_1.TestKind).includes(value);
}
function isValidManagedIdentityType(value) {
    return Object.values(UtilModels_1.ManagedIdentityType).includes(value);
}
function isArrayOfStrings(variable) {
    return Array.isArray(variable) && variable.every((item) => typeof item === 'string');
}
function inValidEngineInstances(engines) {
    if (engines > 400 || engines < 1) {
        return true;
    }
    return false;
}
function checkValidityYaml(givenYaml) {
    var _a, _b;
    if (!isDictionary(givenYaml)) {
        return { valid: false, error: `Invalid YAML syntax.` };
    }
    let unSupportedKeys = [];
    let supportedKeys = Object.keys(constants_1.defaultYaml);
    Object.keys(givenYaml).forEach(element => {
        if (supportedKeys.indexOf(element) == -1) {
            unSupportedKeys.push(element);
        }
    });
    if (unSupportedKeys.length) {
        const result = unSupportedKeys.map(element => `${element}`).join(", ");
        return { valid: false, error: `The YAML file provided has unsupported field(s) "${result}".` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.testName) && (0, util_1.isNullOrUndefined)(givenYaml.testId)) {
        return { valid: false, error: "The required field testId is missing in the load test YAML file." };
    }
    let testId = '';
    if (!(0, util_1.isNullOrUndefined)(givenYaml.testName)) {
        testId = givenYaml.testName;
    }
    if (!(0, util_1.isNullOrUndefined)(givenYaml.testId)) {
        testId = givenYaml.testId;
    }
    testId = testId.toLowerCase();
    if (typeof (testId) != "string" || invalidName(testId)) {
        return { valid: false, error: `The value "${testId}" for testId is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.` };
    }
    if (givenYaml.displayName && (typeof givenYaml.displayName != 'string' || invalidDisplayName(givenYaml.displayName))) {
        return { valid: false, error: `The value "${givenYaml.displayName}" for displayName is invalid. Display name must be a string of length between 2 to 50.` };
    }
    if (givenYaml.description && (typeof givenYaml.description != 'string' || invalidDescription(givenYaml.description))) {
        return { valid: false, error: `The value "${givenYaml.description}" for description is invalid. Description must be a string of length less than 100.` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.testPlan)) {
        return { valid: false, error: "The required field testPlan is missing in the load test YAML file." };
    }
    if (givenYaml.engineInstances && (isNaN(givenYaml.engineInstances) || inValidEngineInstances(givenYaml.engineInstances))) {
        return { valid: false, error: `The value "${givenYaml.engineInstances}" for engineInstances is invalid. The value should be an integer between 1 and 400.` };
    }
    let kind = (_a = givenYaml.testType) !== null && _a !== void 0 ? _a : TestKind_1.TestKind.JMX;
    if (!isValidTestKind(kind)) {
        return { valid: false, error: `The value "${kind}" for testType is invalid. Acceptable values are ${EngineUtil.Resources.Strings.allFrameworksFriendly}.` };
    }
    let framework = EngineUtil.getLoadTestFrameworkModelFromKind(kind);
    if (givenYaml.testType == TestKind_1.TestKind.URL) {
        if (!checkFileType(givenYaml.testPlan, 'json')) {
            return { valid: false, error: "The testPlan for a URL test should of type \"json\"." };
        }
    }
    else if (!checkFileType(givenYaml.testPlan, framework.testScriptFileExtension)) {
        return { valid: false, error: `The testPlan for a ${kind} test should of type "${framework.testScriptFileExtension}".` };
    }
    if (givenYaml.subnetId && (typeof givenYaml.subnetId != 'string' || isInValidSubnet(givenYaml.subnetId))) {
        return { valid: false, error: `The value "${givenYaml.subnetId}" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".` };
    }
    if (givenYaml.keyVaultReferenceIdentity && (typeof givenYaml.keyVaultReferenceIdentity != 'string' || isInValidKVId(givenYaml.keyVaultReferenceIdentity))) {
        return { valid: false, error: `The value "${givenYaml.keyVaultReferenceIdentity}" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".` };
    }
    if (givenYaml.keyVaultReferenceIdentityType != undefined && givenYaml.keyVaultReferenceIdentityType != null && !isValidManagedIdentityType(givenYaml.keyVaultReferenceIdentityType)) {
        return { valid: false, error: `The value "${givenYaml.keyVaultReferenceIdentityType}" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".` };
    }
    if (!(0, util_1.isNullOrUndefined)(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == UtilModels_1.ManagedIdentityType.SystemAssigned) {
        return { valid: false, error: `The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == UtilModels_1.ManagedIdentityType.UserAssigned) {
        return { valid: false, error: `"The value for 'keyVaultReferenceIdentity' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'keyVaultReferenceIdentity'."` };
    }
    if (givenYaml.publicIPDisabled && typeof givenYaml.publicIPDisabled != 'boolean') {
        return { valid: false, error: `The value "${givenYaml.publicIPDisabled}" for publicIPDisabled is invalid. The value should be either true or false.` };
    }
    if (givenYaml.publicIPDisabled && (0, util_1.isNullOrUndefined)(givenYaml.subnetId)) {
        return { valid: false, error: `Public IP deployment can only be disabled for tests against private endpoints. For public endpoints, set publicIPDisabled to False.` };
    }
    if (givenYaml.configurationFiles && !isArrayOfStrings(givenYaml.configurationFiles)) {
        return { valid: false, error: `The value "${givenYaml.configurationFiles}" for configurationFiles is invalid. Provide a valid list of strings.` };
    }
    if (givenYaml.zipArtifacts && !isArrayOfStrings(givenYaml.zipArtifacts)) {
        return { valid: false, error: `The value "${givenYaml.zipArtifacts}" for zipArtifacts is invalid. Provide a valid list of strings.` };
    }
    if (givenYaml.splitAllCSVs && typeof givenYaml.splitAllCSVs != 'boolean') {
        return { valid: false, error: `The value "${givenYaml.splitAllCSVs}" for splitAllCSVs is invalid. The value should be either true or false` };
    }
    if (givenYaml.properties != undefined && givenYaml.properties.userPropertyFile != undefined) {
        if ((0, util_1.isNull)(givenYaml.properties.userPropertyFile) || typeof givenYaml.properties.userPropertyFile != 'string' || !checkFileTypes(givenYaml.properties.userPropertyFile, framework.userPropertyFileExtensions)) {
            return { valid: false, error: `The value "${givenYaml.properties.userPropertyFile}" for userPropertyFile is invalid. Provide a valid file path of type ${framework.ClientResources.userPropertyFileExtensionsFriendly}. Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.` };
        }
    }
    if (givenYaml.autoStop) {
        if (typeof givenYaml.autoStop != 'string') {
            if ((0, util_1.isNullOrUndefined)(givenYaml.autoStop.errorPercentage) || isNaN(givenYaml.autoStop.errorPercentage) || givenYaml.autoStop.errorPercentage > 100 || givenYaml.autoStop.errorPercentage < 0) {
                return { valid: false, error: `The value "${givenYaml.autoStop.errorPercentage}" for errorPercentage of auto-stop criteria is invalid. The value should be valid decimal number from 0 to 100.` };
            }
            if ((0, util_1.isNullOrUndefined)(givenYaml.autoStop.timeWindow) || isNaN(givenYaml.autoStop.timeWindow) || givenYaml.autoStop.timeWindow <= 0 || !Number.isInteger(givenYaml.autoStop.timeWindow)) {
                return { valid: false, error: `The value "${givenYaml.autoStop.timeWindow}" for timeWindow of auto-stop criteria is invalid. The value should be valid integer greater than 0.` };
            }
        }
        else if (givenYaml.autoStop != "disable") {
            return { valid: false, error: 'Invalid value for "autoStop", for disabling auto stop use "autoStop: disable"' };
        }
    }
    if (givenYaml.regionalLoadTestConfig) {
        if (!Array.isArray(givenYaml.regionalLoadTestConfig)) {
            return { valid: false, error: `The value "${givenYaml.regionalLoadTestConfig}" for regionalLoadTestConfig is invalid. Provide a valid list of region configuration for Multi-region load test.` };
        }
        if (givenYaml.regionalLoadTestConfig.length < 2) {
            return { valid: false, error: `Multi-region load tests should contain a minimum of 2 geographic regions in the configuration.` };
        }
        var totalEngineCount = 0;
        for (let i = 0; i < givenYaml.regionalLoadTestConfig.length; i++) {
            if ((0, util_1.isNullOrUndefined)(givenYaml.regionalLoadTestConfig[i].region) || typeof givenYaml.regionalLoadTestConfig[i].region != 'string' || givenYaml.regionalLoadTestConfig[i].region == "") {
                return { valid: false, error: `The value "${givenYaml.regionalLoadTestConfig[i].region}" for region in regionalLoadTestConfig is invalid. Provide a valid string.` };
            }
            if ((0, util_1.isNullOrUndefined)(givenYaml.regionalLoadTestConfig[i].engineInstances) || isNaN(givenYaml.regionalLoadTestConfig[i].engineInstances) || inValidEngineInstances(givenYaml.regionalLoadTestConfig[i].engineInstances)) {
                return { valid: false, error: `The value "${givenYaml.regionalLoadTestConfig[i].engineInstances}" for engineInstances in regionalLoadTestConfig is invalid. The value should be an integer between 1 and 400.` };
            }
            totalEngineCount += givenYaml.regionalLoadTestConfig[i].engineInstances;
        }
        let engineInstances = (_b = givenYaml.engineInstances) !== null && _b !== void 0 ? _b : 1;
        if (totalEngineCount != givenYaml.engineInstances) {
            return { valid: false, error: `The sum of engineInstances in regionalLoadTestConfig should be equal to the value of totalEngineInstances "${engineInstances}" in the test configuration.` };
        }
    }
    return { valid: true, error: "" };
}
/*
    ado takes the full pf criteria as a string after parsing the string into proper data model,
*/
function getPassFailCriteriaFromString(passFailCriteria) {
    let failureCriteriaValue = {};
    passFailCriteria.forEach(criteria => {
        let criteriaString = criteria;
        let data = {
            aggregate: "",
            clientMetric: "",
            condition: "",
            value: "",
            requestName: "",
            action: "",
        };
        if (typeof criteria !== "string") {
            let request = Object.keys(criteria)[0];
            data.requestName = request;
            criteriaString = criteria[request];
        }
        let tempStr = "";
        for (let i = 0; i < criteriaString.length; i++) {
            if (criteriaString[i] == '(') {
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if (criteriaString[i] == ')') {
                data.clientMetric = tempStr;
                tempStr = "";
            }
            else if (criteriaString[i] == ',') {
                data.condition = tempStr.substring(0, indexOfFirstDigit(tempStr)).trim();
                data.value = tempStr.substr(indexOfFirstDigit(tempStr)).trim();
                tempStr = "";
            }
            else {
                tempStr += criteriaString[i];
            }
        }
        if (criteriaString.indexOf(',') != -1) {
            data.action = tempStr.trim();
        }
        else {
            data.condition = tempStr.substring(0, indexOfFirstDigit(tempStr)).trim();
            data.value = tempStr.substr(indexOfFirstDigit(tempStr)).trim();
        }
        ValidateCriteriaAndConvertToWorkingStringModel(data, failureCriteriaValue);
    });
    return failureCriteriaValue;
}
/*
    ado takes the full pf criteria as a string after parsing the string into proper data model,
    this is to avoid duplicates of the data by keeping the full aggrregated metric
    as a key and the values will be set in this function to use it further
*/
function ValidateCriteriaAndConvertToWorkingStringModel(data, failureCriteriaValue) {
    if (data.action == "")
        data.action = "continue";
    data.value = removeUnits(data.value);
    if (!validCriteria(data))
        throw new Error("Invalid Failure Criteria");
    let key = data.clientMetric + ' ' + data.aggregate + ' ' + data.condition + ' ' + data.action;
    if (data.requestName != "") {
        key = key + ' ' + data.requestName;
    }
    let val = parseInt(data.value);
    let currVal = val;
    if (failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if (data.condition == '>') {
        failureCriteriaValue[key] = (val < currVal) ? val : currVal;
    }
    else {
        failureCriteriaValue[key] = (val > currVal) ? val : currVal;
    }
}
function validateUrl(url) {
    var r = new RegExp(/(http|https):\/\/.*\/secrets\/.+$/);
    return r.test(url);
}
function validateUrlcert(url) {
    var r = new RegExp(/(http|https):\/\/.*\/certificates\/.+$/);
    return r.test(url);
}
function getDefaultTestName() {
    const a = (new Date(Date.now())).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "Test_" + b[0] + "_" + c[1] + c[2];
}
function getDefaultTestRunName() {
    const a = (new Date(Date.now())).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "TestRun_" + b[0] + "_" + c[1] + c[2];
}
function getDefaultRunDescription() {
    return "Started using GitHub Actions";
}
function validateTestRunParamsFromPipeline(runTimeParams) {
    if (runTimeParams.runDisplayName && invalidDisplayName(runTimeParams.runDisplayName))
        throw new Error("Invalid test run name. Test run name must be between 2 to 50 characters.");
    if (runTimeParams.runDescription && invalidDescription(runTimeParams.runDescription))
        throw new Error("Invalid test run description. Test run description must be less than 100 characters.");
}
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
