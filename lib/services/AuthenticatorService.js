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
exports.AuthenticatorService = void 0;
const UtilModels_1 = require("../models/UtilModels");
const jwt_decode_1 = require("jwt-decode");
const AzCliUtility = __importStar(require("../Utils/AzCliUtility"));
class AuthenticatorService {
    constructor(taskParameters) {
        this.dataPlanetoken = '';
        this.controlPlaneToken = '';
        this.taskParameters = taskParameters;
    }
    getDataPlaneHeader(apicallType) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!this.isTokenValid(UtilModels_1.TokenScope.Dataplane)) {
                let tokenRes = yield this.getTokenAPI(UtilModels_1.TokenScope.Dataplane);
                this.dataPlanetoken = tokenRes;
            }
            let headers = {
                'content-type': (_a = UtilModels_1.ContentTypeMap[apicallType]) !== null && _a !== void 0 ? _a : 'application/json',
                'Authorization': 'Bearer ' + this.dataPlanetoken
            };
            return headers;
        });
    }
    getARMTokenHeader() {
        return __awaiter(this, void 0, void 0, function* () {
            // right now only get calls from the GH, so no need of content type for now for the get calls.
            var tokenRes = yield this.getTokenAPI(UtilModels_1.TokenScope.ControlPlane);
            this.controlPlaneToken = tokenRes;
            let headers = {
                'Authorization': 'Bearer ' + this.controlPlaneToken,
            };
            return headers;
        });
    }
    getTokenAPI(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenScopeDecoded = scope == UtilModels_1.TokenScope.Dataplane ? this.taskParameters.dataPlaneTokenScope : this.taskParameters.armTokenScope;
            try {
                const cmdArguments = ["account", "get-access-token", "--resource"];
                cmdArguments.push(tokenScopeDecoded);
                let result = yield AzCliUtility.execAz(cmdArguments);
                let token = result.accessToken;
                scope == UtilModels_1.TokenScope.ControlPlane ? this.controlPlaneToken = token : this.dataPlanetoken = token;
                return token;
            }
            catch (err) {
                const message = `An error occurred while getting credentials from ` + `Azure CLI: ${err.message}`;
                throw new Error(message);
            }
        });
    }
    isTokenValid(scope) {
        let token = scope == UtilModels_1.TokenScope.Dataplane ? this.dataPlanetoken : this.controlPlaneToken;
        try {
            let header = token && (0, jwt_decode_1.jwtDecode)(token);
            const now = Math.floor(Date.now() / 1000);
            return (header && (header === null || header === void 0 ? void 0 : header.exp) && header.exp + 2 > now);
        }
        catch (error) {
            console.log("Error in getting the token");
        }
    }
}
exports.AuthenticatorService = AuthenticatorService;
