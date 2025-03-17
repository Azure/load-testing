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
exports.FeatureFlagService = void 0;
const GeneralConstants_1 = require("../Constants/GeneralConstants");
const util = __importStar(require("../Utils/CommonUtils"));
const UtilModels_1 = require("../models/UtilModels");
const FetchUtil = __importStar(require("../Utils/FetchUtils"));
class FeatureFlagService {
    constructor(authContext) {
        this.featureFlagCache = {};
        this.authContext = authContext;
    }
    getFeatureFlagAsync(flag_1, baseUrl_1) {
        return __awaiter(this, arguments, void 0, function* (flag, baseUrl, useCache = true) {
            if (useCache && flag in this.featureFlagCache) {
                return { featureFlag: flag, enabled: this.featureFlagCache[flag.toString()] };
            }
            let uri = (new URL(GeneralConstants_1.APIRoute.FeatureFlags(flag.toString()), baseUrl)).toString();
            let headers = this.authContext.getDataPlaneHeader(UtilModels_1.FetchCallType.get);
            let flagResponse = yield FetchUtil.httpClientRetries(uri, headers, UtilModels_1.FetchCallType.get, 3, "", false, false);
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
    isFeatureEnabledAsync(flag_1, baseUrl_1) {
        return __awaiter(this, arguments, void 0, function* (flag, baseUrl, useCache = true) {
            let flagObj = yield this.getFeatureFlagAsync(flag, baseUrl, useCache);
            return flagObj ? flagObj.enabled : false;
        });
    }
}
exports.FeatureFlagService = FeatureFlagService;
