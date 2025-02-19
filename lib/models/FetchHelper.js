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
const util_1 = require("./util");
const UtilModels_1 = require("./UtilModels");
const httpc = __importStar(require("typed-rest-client/HttpClient"));
const FileUtils_1 = require("./FileUtils");
const httpClient = new httpc.HttpClient('MALT-GHACTION');
const core = __importStar(require("@actions/core"));
// (note mohit): shift to the enum later.
function httpClientRetries(urlSuffix_1, header_1, method_1) {
    return __awaiter(this, arguments, void 0, function* (urlSuffix, header, method, retries = 1, data, isUploadCall = true, log = true) {
        let httpResponse;
        try {
            let correlationId = `azdo-${(0, util_1.getUniqueId)()}`;
            header[UtilModels_1.correlationHeader] = correlationId; // even if we put console.debug its printing along with the logs, so lets just go ahead with the differentiation with azdo, so we can search the timeframe for azdo in correlationid and resource filter.
            if (method == 'get') {
                httpResponse = yield httpClient.get(urlSuffix, header);
            }
            else if (method == 'del') {
                httpResponse = yield httpClient.del(urlSuffix, header);
            }
            else if (method == 'put' && isUploadCall) {
                let fileContent = (0, FileUtils_1.uploadFileData)(data);
                httpResponse = yield httpClient.request(method, urlSuffix, fileContent, header);
            }
            else {
                httpResponse = yield httpClient.request(method, urlSuffix, data, header);
            }
            if (httpResponse.message.statusCode != undefined && httpResponse.message.statusCode >= 300) {
                core.debug(`correlation id : ${correlationId}`);
            }
            if (httpResponse.message.statusCode != undefined && [408, 429, 502, 503, 504].includes(httpResponse.message.statusCode)) {
                let err = yield (0, util_1.getResultObj)(httpResponse);
                throw { message: (err && err.error && err.error.message) ? err.error.message : (0, util_1.ErrorCorrection)(httpResponse) }; // throwing as message to catch it as err.message
            }
            return httpResponse;
        }
        catch (err) {
            if (retries) {
                let sleeptime = (5 - retries) * 1000 + Math.floor(Math.random() * 5001);
                if (log) {
                    console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime / 1000} seconds`);
                }
                yield (0, util_1.sleep)(sleeptime);
                return yield httpClientRetries(urlSuffix, header, method, retries - 1, data);
            }
            else {
                throw new Error(`Operation did not succeed after 3 retries. Pipeline failed with error : ${err.message}`);
            }
        }
    });
}
