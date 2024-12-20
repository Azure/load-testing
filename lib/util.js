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
exports.getAllFileErrors = exports.ErrorCorrection = exports.getResultObj = exports.validCriteria = exports.isTerminalTestStatus = exports.removeUnits = exports.indexOfFirstDigit = exports.deleteFile = exports.getReportFolder = exports.getResultFolder = exports.checkValidityYaml = exports.invalidDescription = exports.invalidDisplayName = exports.invalidName = exports.getUniqueId = exports.sleep = exports.printClientMetrics = exports.uploadFileToResultsFolder = exports.printCriteria = exports.printTestDuration = exports.checkFileTypes = exports.checkFileType = exports.httpClientRetries = exports.uploadFileData = exports.ManagedIdentityType = exports.apiConstants = void 0;
const fs = __importStar(require("fs"));
var path = require('path');
var AdmZip = require("adm-zip");
const { v4: uuidv4 } = require('uuid');
const core = __importStar(require("@actions/core"));
const httpc = require("typed-rest-client/HttpClient");
const httpClient = new httpc.HttpClient('MALT-GHACTION');
const stream_1 = require("stream");
const util_1 = require("util");
const constants_1 = require("./constants");
const EngineUtil = __importStar(require("./engine/Util"));
const TestKind_1 = require("./engine/TestKind");
const validAggregateList = {
    'response_time_ms': ['avg', 'min', 'max', 'p50', 'p75', 'p90', 'p95', 'p96', 'p97', 'p98', 'p99', 'p999', 'p9999'],
    'requests_per_sec': ['avg'],
    'requests': ['count'],
    'latency': ['avg', 'min', 'max', 'p50', 'p75', 'p90', 'p95', 'p96', 'p97', 'p98', 'p99', 'p999', 'p9999'],
    'error': ['percentage']
};
const validConditionList = {
    'response_time_ms': ['>', '<'],
    'requests_per_sec': ['>', '<'],
    'requests': ['>', '<'],
    'latency': ['>', '<'],
    'error': ['>']
};
var apiConstants;
(function (apiConstants) {
    apiConstants.latestVersion = '2024-05-01-preview';
    apiConstants.tm2022Version = '2022-11-01';
    apiConstants.cp2022Version = '2022-12-01';
})(apiConstants || (exports.apiConstants = apiConstants = {}));
var ManagedIdentityType;
(function (ManagedIdentityType) {
    ManagedIdentityType["SystemAssigned"] = "SystemAssigned";
    ManagedIdentityType["UserAssigned"] = "UserAssigned";
})(ManagedIdentityType || (exports.ManagedIdentityType = ManagedIdentityType = {}));
function uploadFileData(filepath) {
    try {
        let filedata = fs.readFileSync(filepath);
        const readable = new stream_1.Readable();
        readable._read = () => { };
        readable.push(filedata);
        readable.push(null);
        return readable;
    }
    catch (err) {
        err.message = "File not found " + filepath;
        throw new Error(err.message);
    }
}
exports.uploadFileData = uploadFileData;
const correlationHeader = 'x-ms-correlation-request-id';
function httpClientRetries(urlSuffix_1, header_1, method_1) {
    return __awaiter(this, arguments, void 0, function* (urlSuffix, header, method, retries = 1, data, isUploadCall = true, log = true) {
        let httpResponse;
        try {
            let correlationId = `gh-actions-${getUniqueId()}`;
            header[correlationHeader] = correlationId; // even if we put console.debug its printing along with the logs, so lets just go ahead with the differentiation with GH-actions, so we can search the timeframe for GH-actions in correlationid and resource filter.
            if (method == 'get') {
                httpResponse = yield httpClient.get(urlSuffix, header);
            }
            else if (method == 'del') {
                httpResponse = yield httpClient.del(urlSuffix, header);
            }
            else if (method == 'put' && isUploadCall) {
                let fileContent = uploadFileData(data);
                httpResponse = yield httpClient.request(method, urlSuffix, fileContent, header);
            }
            else {
                httpResponse = yield httpClient.request(method, urlSuffix, data, header);
            }
            if (httpResponse.message.statusCode != undefined && httpResponse.message.statusCode >= 300) {
                core.debug(`correlation id : ${correlationId}`);
            }
            if (httpResponse.message.statusCode != undefined && [408, 429, 502, 503, 504].includes(httpResponse.message.statusCode)) {
                let err = yield getResultObj(httpResponse);
                throw { message: (err && err.error && err.error.message) ? err.error.message : ErrorCorrection(httpResponse) }; // throwing as message to catch it as err.message
            }
            return httpResponse;
        }
        catch (err) {
            if (retries) {
                let sleeptime = (5 - retries) * 1000 + Math.floor(Math.random() * 5001);
                yield sleep(sleeptime);
                if (log) {
                    console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime / 1000} seconds`);
                }
                return httpClientRetries(urlSuffix, header, method, retries - 1, data);
            }
            else
                throw new Error(`Operation did not succeed after 3 retries. Pipeline failed with error : ${err.message}`);
        }
    });
}
exports.httpClientRetries = httpClientRetries;
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
function printTestDuration(vusers, startTime, endTime, testStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Summary generation completed\n");
        console.log("-------------------Summary ---------------");
        console.log("TestRun start time: " + startTime);
        console.log("TestRun end time: " + endTime);
        console.log("Virtual Users: " + vusers);
        console.log(`TestStatus: ${testStatus} \n`);
        return;
    });
}
exports.printTestDuration = printTestDuration;
function printCriteria(criteria) {
    if (Object.keys(criteria).length == 0)
        return;
    printTestResult(criteria);
    console.log("Criteria\t\t\t\t\t :Actual Value\t        Result");
    for (var key in criteria) {
        var metric = criteria[key];
        var str = metric.aggregate + "(" + metric.clientMetric + ") " + metric.condition + ' ' + metric.value;
        if (metric.requestName != null) {
            str = metric.requestName + ": " + str;
        }
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
function printTestResult(criteria) {
    let pass = 0;
    let fail = 0;
    for (var key in criteria) {
        if (criteria[key].result == "passed")
            pass++;
        else if (criteria[key].result == "failed")
            fail++;
    }
    console.log("-------------------Test Criteria ---------------");
    console.log("Results\t\t\t :" + pass + " Pass  " + fail + " Fail\n");
}
function uploadFileToResultsFolder(response_1) {
    return __awaiter(this, arguments, void 0, function* (response, fileName = 'results.zip') {
        try {
            const filePath = path.join('loadTest', fileName);
            const file = fs.createWriteStream(filePath);
            return new Promise((resolve, reject) => {
                file.on("error", (err) => reject(err));
                const stream = response.message.pipe(file);
                stream.on("close", () => {
                    try {
                        resolve(filePath);
                    }
                    catch (err) {
                        reject(err);
                    }
                });
            });
        }
        catch (err) {
            err.message = "Error in fetching the results of the testRun";
            throw new Error(err);
        }
    });
}
exports.uploadFileToResultsFolder = uploadFileToResultsFolder;
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
    return uuidv4().toString();
}
exports.getUniqueId = getUniqueId;
function isDictionary(variable) {
    return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}
function invalidName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    var r = new RegExp(/[^a-z0-9_-]+/);
    return r.test(value);
}
exports.invalidName = invalidName;
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
    return Object.values(ManagedIdentityType).includes(value);
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
    if (!(0, util_1.isNullOrUndefined)(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == ManagedIdentityType.SystemAssigned) {
        return { valid: false, error: `The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == ManagedIdentityType.UserAssigned) {
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
exports.checkValidityYaml = checkValidityYaml;
function getResultFolder(testArtifacts) {
    if (testArtifacts == null || testArtifacts.outputArtifacts == null)
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return (outputurl.resultFileInfo != null) ? outputurl.resultFileInfo.url : null;
}
exports.getResultFolder = getResultFolder;
function getReportFolder(testArtifacts) {
    if (testArtifacts == null || testArtifacts.outputArtifacts == null)
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return (outputurl.reportFileInfo != null) ? outputurl.reportFileInfo.url : null;
}
exports.getReportFolder = getReportFolder;
function deleteFile(foldername) {
    if (fs.existsSync(foldername)) {
        fs.readdirSync(foldername).forEach((file, index) => {
            const curPath = path.join(foldername, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFile(curPath);
            }
            else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(foldername);
    }
}
exports.deleteFile = deleteFile;
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
    if (testStatus === "DONE" || testStatus === "FAILED" || testStatus === "CANCELLED") {
        return true;
    }
    return false;
}
exports.isTerminalTestStatus = isTerminalTestStatus;
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
exports.validCriteria = validCriteria;
function validResponseTimeCriteria(data) {
    return !(!validAggregateList['response_time_ms'].includes(data.aggregate) || !validConditionList['response_time_ms'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validRequestsPerSecondCriteria(data) {
    return !(!validAggregateList['requests_per_sec'].includes(data.aggregate) || !validConditionList['requests_per_sec'].includes(data.condition)
        || data.action != "continue");
}
function validRequestsCriteria(data) {
    return !(!validAggregateList['requests'].includes(data.aggregate) || !validConditionList['requests'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validLatencyCriteria(data) {
    return !(!validAggregateList['latency'].includes(data.aggregate) || !validConditionList['latency'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validErrorCriteria(data) {
    return !(!validAggregateList['error'].includes(data.aggregate) || !validConditionList['error'].includes(data.condition)
        || Number(data.value) < 0 || Number(data.value) > 100 || data.action != "continue");
}
function getResultObj(data) {
    return __awaiter(this, void 0, void 0, function* () {
        var dataString;
        var dataJSON;
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
function ErrorCorrection(result) {
    return "Unable to fetch the response. Please re-run or contact support if the issue persists. " + "Status code: " + result.message.statusCode;
}
exports.ErrorCorrection = ErrorCorrection;
function getAllFileErrors(testObj) {
    var allArtifacts = [];
    for (var key in testObj.inputArtifacts) {
        var artifacts = testObj.inputArtifacts[key];
        if (artifacts instanceof Array) {
            allArtifacts = allArtifacts.concat(artifacts.filter((artifact) => artifact !== null && artifact !== undefined));
        }
        else if (artifacts !== null && artifacts !== undefined) {
            allArtifacts.push(artifacts);
        }
    }
    var fileErrors = {};
    for (const file of allArtifacts) {
        if (file.validationStatus === "VALIDATION_FAILURE") {
            fileErrors[file.fileName] = file.validationFailureDetails;
        }
    }
    return fileErrors;
}
exports.getAllFileErrors = getAllFileErrors;
