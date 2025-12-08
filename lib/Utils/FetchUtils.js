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
exports.httpClientRetries = httpClientRetries;
const CommonUtils_1 = require("./CommonUtils");
const UtilModels_1 = require("./../models/UtilModels");
const httpc = __importStar(require("typed-rest-client/HttpClient"));
const FileUtils_1 = require("./FileUtils");
const httpClient = new httpc.HttpClient('MALT-GHACTION');
const CoreUtils = __importStar(require("./CoreUtils"));
const methodEnumToString = {
    [UtilModels_1.FetchCallType.get]: "get",
    [UtilModels_1.FetchCallType.post]: "post",
    [UtilModels_1.FetchCallType.put]: "put",
    [UtilModels_1.FetchCallType.delete]: "del",
    [UtilModels_1.FetchCallType.patch]: "patch"
};
// (note mohit): shift to the enum later.
function httpClientRetries(urlSuffix, header, method, retries = 1, data, isUploadCall = true, log = true) {
    return __awaiter(this, void 0, void 0, function* () {
        let httpResponse;
        const retrriableCodes = [408, 429, 500, 502, 503, 504]; // 408 - Request Timeout, 429 - Too Many Requests, 500 - Internal Server Error, 502 - Bad Gateway, 503 - Service Unavailable, 504 - Gateway Timeout
        let backOffTimeForRetry = 5; // seconds
        let correlationId = `gh-actions-${(0, CommonUtils_1.getUniqueId)()}`;
        try {
            header[UtilModels_1.correlationHeader] = correlationId; // even if we put console.debug its printing along with the logs, so lets just go ahead with the differentiation with azdo, so we can search the timeframe for azdo in correlationid and resource filter.
            if (method == UtilModels_1.FetchCallType.get) {
                httpResponse = yield httpClient.get(urlSuffix, header);
            }
            else if (method == UtilModels_1.FetchCallType.delete) {
                httpResponse = yield httpClient.del(urlSuffix, header);
            }
            else if (method == UtilModels_1.FetchCallType.post) {
                httpResponse = yield httpClient.post(urlSuffix, data, header);
            }
            else if (method == UtilModels_1.FetchCallType.put && isUploadCall) {
                let fileContent = (0, FileUtils_1.uploadFileData)(data);
                httpResponse = yield httpClient.request(methodEnumToString[method], urlSuffix, fileContent, header);
            }
            else {
                const githubBaseUrl = process.env.GITHUB_SERVER_URL;
                const repository = process.env.GITHUB_REPOSITORY;
                const runId = process.env.GITHUB_RUN_ID;
                const pipelineName = process.env.GITHUB_WORKFLOW || "Unknown Pipeline";
                const pipelineUri = `${githubBaseUrl}/${repository}/actions/runs/${runId}`;
                header['x-ms-pipeline-name'] = (0, CommonUtils_1.sanitisePipelineNameHeader)(pipelineName); // setting these for patch calls.
                header['x-ms-pipeline-uri'] = pipelineUri;
                httpResponse = yield httpClient.request(methodEnumToString[method], urlSuffix, data, header);
            }
            if (httpResponse.message.statusCode != undefined && httpResponse.message.statusCode >= 300) {
                CoreUtils.debug(`correlation id : ${correlationId}`);
            }
            if (httpResponse.message.statusCode != undefined && retrriableCodes.includes(httpResponse.message.statusCode)) {
                if (method == UtilModels_1.FetchCallType.patch) {
                    backOffTimeForRetry += 60; // extra 60 seconds for patch, basically this happens when the service didnot handle some of the external service dependencies, and the external can take time to recover.
                }
                let err = yield (0, CommonUtils_1.getResultObj)(httpResponse);
                throw { message: (err && err.error && err.error.message) ? err.error.message : (0, CommonUtils_1.errorCorrection)(httpResponse) }; // throwing as message to catch it as err.message
            }
            return httpResponse;
        }
        catch (err) {
            if (retries) {
                let sleeptime = backOffTimeForRetry * 1000;
                if (log) {
                    console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime / 1000} seconds`);
                }
                yield (0, CommonUtils_1.sleep)(sleeptime);
                return yield httpClientRetries(urlSuffix, header, method, retries - 1, data);
            }
            else {
                console.log(err, "\ncorrelationId:" + correlationId);
                throw new Error(`Operation did not succeed after 3 retries. Pipeline failed with error : ${err.message}`);
            }
        }
    });
}
