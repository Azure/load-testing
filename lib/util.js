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
exports.ErrorCorrection = exports.getResultObj = exports.validCriteria = exports.isTerminalTestStatus = exports.removeUnits = exports.indexOfFirstDigit = exports.deleteFile = exports.getResultFolder = exports.getUniqueId = exports.sleep = exports.getStatisticsFile = exports.printClientMetrics = exports.getResultsFile = exports.printCriteria = exports.printTestDuration = exports.checkFileType = exports.httpClientRetries = exports.apiConstants = void 0;
const fs = __importStar(require("fs"));
var path = require('path');
var AdmZip = require("adm-zip");
const { v4: uuidv4 } = require('uuid');
const core = __importStar(require("@actions/core"));
const httpc = require("typed-rest-client/HttpClient");
const httpClient = new httpc.HttpClient('MALT-GHACTION');
const map = __importStar(require("./mappers"));
const util_1 = require("util");
const validAggregateList = {
    'response_time_ms': ['avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'],
    'requests_per_sec': ['avg'],
    'requests': ['count'],
    'latency': ['avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'],
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
    apiConstants.tm2023Version = '2023-04-01-preview';
    apiConstants.tm2022Version = '2022-11-01';
    apiConstants.cp2022Version = '2022-12-01';
})(apiConstants || (exports.apiConstants = apiConstants = {}));
const correlationHeader = 'x-ms-correlation-request-id';
function httpClientRetries(urlSuffix, header, method, retries = 1, data, isUploadCall = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpResponse;
        try {
            let correlationId = `gh-actions-${getUniqueId()}`;
            header[correlationHeader] = correlationId; // even if we put console.debug its printing along with the logs, so lets just go ahead with the differentiation with gh-actions, so we can search the timeframe for gh-actions in correlationid and resource filter.
            if (method == 'get') {
                httpResponse = yield httpClient.get(urlSuffix, header);
            }
            else if (method == 'del') {
                httpResponse = yield httpClient.del(urlSuffix, header);
            }
            else if (method == 'put' && isUploadCall) {
                let fileContent = map.uploadFileData(data);
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
                console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime / 1000} seconds`);
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
function printTestDuration(vusers, startTime, endTime, testStatus) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("TestRun completed\n");
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
function getResultsFile(response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filePath = path.join('loadTest', 'results.zip');
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
exports.getResultsFile = getResultsFile;
function printClientMetrics(obj) {
    return __awaiter(this, void 0, void 0, function* () {
        if (Object.keys(obj).length == 0)
            return;
        console.log("------------------Client-side metrics------------\n");
        for (var key in obj) {
            if (key != "Total")
                printMetrics(obj[key]);
        }
    });
}
exports.printClientMetrics = printClientMetrics;
function getStatisticsFile(obj) {
    var obj;
    return __awaiter(this, void 0, void 0, function* () {
        let target = path.join('dropResults', "reports");
        try {
            var filepath = path.join('dropResults', 'results.zip');
            var zip = new AdmZip(filepath);
            zip.extractAllTo(target);
            let stats = path.join(target, "statistics.json");
            let json = fs.readFileSync(stats, 'utf8');
            obj = JSON.parse(json);
            console.log("------------------Client-side metrics------------\n");
            for (var key in obj) {
                if (key != "Total")
                    printMetrics(obj[key]);
            }
            deleteFile(target);
        }
        catch (err) {
            err.message = "Error in fetching the client-side metrics of the testRun";
            throw new Error(err);
        }
    });
}
exports.getStatisticsFile = getStatisticsFile;
function printMetrics(data) {
    console.log(data.transaction);
    console.log("response time \t\t : avg=" + getAbsVal(data.meanResTime) + "ms min=" + getAbsVal(data.minResTime) + "ms med=" + getAbsVal(data.medianResTime) + "ms max=" + getAbsVal(data.maxResTime) + "ms p(90)=" + getAbsVal(data.pct1ResTime) + "ms p(95)=" + getAbsVal(data.pct2ResTime) + "ms p(99)=" + getAbsVal(data.pct3ResTime) + "ms");
    console.log("requests per sec \t : avg=" + getAbsVal(data.throughput));
    console.log("total requests \t\t : " + data.sampleCount);
    console.log("total errors \t\t : " + data.errorCount);
    console.log("total error rate \t : " + data.errorPct + "\n");
}
function getAbsVal(data) {
    data = data.toString();
    var index = data.indexOf(".");
    if (index != -1)
        data = data.substr(0, index);
    return data;
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
function getResultFolder(testArtifacts) {
    if (testArtifacts == null || testArtifacts.outputArtifacts == null)
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return (outputurl.resultFileInfo != null) ? outputurl.resultFileInfo.url : null;
}
exports.getResultFolder = getResultFolder;
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
