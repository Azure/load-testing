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
exports.FeatureFlagService = void 0;
const constants_1 = require("../constants");
const map = __importStar(require("../mappers"));
const util = __importStar(require("../util"));
class FeatureFlagService {
    static getFeatureFlagAsync(flag_1, baseUrl_1) {
        return __awaiter(this, arguments, void 0, function* (flag, baseUrl, useCache = true) {
            if (useCache && flag in this.featureFlagCache) {
                return { featureFlag: flag, enabled: this.featureFlagCache[flag.toString()] };
            }
            let uri = baseUrl + constants_1.APIRoute.FeatureFlags(flag.toString());
            let headers = {
                'content-type': 'application/json',
                'Authorization': 'Bearer ' + map.getToken()
            };
            let flagResponse = yield util.httpClientRetries(uri, headers, 'get', 3, "", false, false);
            try {
                let flagObj = (yield util.getResultObj(flagResponse));
                this.featureFlagCache[flag.toString()] = flagObj.enabled;
                return flagObj;
            }
            catch (error) {
                // remove item from dict
                // handle in case getFlag was called with cache true once and then with cache false, and failed during second call
                // remove the item from cache so that it can be fetched again rather than using old value
                delete this.featureFlagCache[flag.toString()];
                return null;
            }
        });
    }
    static isFeatureEnabledAsync(flag_1, baseUrl_1) {
        return __awaiter(this, arguments, void 0, function* (flag, baseUrl, useCache = true) {
            let flagObj = yield this.getFeatureFlagAsync(flag, baseUrl, useCache);
            return flagObj ? flagObj.enabled : false;
        });
    }
}
exports.FeatureFlagService = FeatureFlagService;
FeatureFlagService.featureFlagCache = {};