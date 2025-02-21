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
exports.AuthenticationUtils = void 0;
const util_1 = require("util");
const core = __importStar(require("@actions/core"));
const child_process_1 = require("child_process");
const UtilModels_1 = require("./UtilModels");
const jwt_decode_1 = require("jwt-decode");
const InputConstants = __importStar(require("./InputConstants"));
class AuthenticationUtils {
    constructor() {
        this.dataPlanetoken = '';
        this.controlPlaneToken = '';
        this.subscriptionId = '';
        this.env = 'AzureCloud';
        this.armTokenScope = 'https://management.core.windows.net';
        this.dataPlaneTokenScope = 'https://loadtest.azure-dev.com';
        this.armEndpoint = 'https://management.azure.com';
        this.resourceId = '';
    }
    authorize() {
        return __awaiter(this, void 0, void 0, function* () {
            // NOTE: This will set the subscription id
            yield this.getTokenAPI(UtilModels_1.TokenScope.ControlPlane);
            const rg = core.getInput(InputConstants.resourceGroup);
            const ltres = core.getInput(InputConstants.loadTestResource);
            if ((0, util_1.isNullOrUndefined)(rg) || rg == '') {
                throw new Error(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
            }
            if ((0, util_1.isNullOrUndefined)(ltres) || ltres == '') {
                throw new Error(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
            }
            this.resourceId = "/subscriptions/" + this.subscriptionId + "/resourcegroups/" + rg + "/providers/microsoft.loadtestservice/loadtests/" + ltres;
            yield this.setEndpointAndScope();
        });
    }
    setEndpointAndScope() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cmdArguments = ["cloud", "show"];
                var result = yield this.execAz(cmdArguments);
                let env = result ? result.name : null;
                this.env = env ? env : this.env;
                let endpointUrl = (result && result.endpoints) ? result.endpoints.resourceManager : null;
                this.armEndpoint = endpointUrl ? endpointUrl : this.armEndpoint;
                if (this.env == 'AzureUSGovernment') {
                    this.dataPlaneTokenScope = 'https://cnt-prod.loadtesting.azure.us';
                    this.armTokenScope = 'https://management.usgovcloudapi.net';
                }
            }
            catch (err) {
                const message = `An error occurred while getting credentials from ` +
                    `Azure CLI for setting endPoint and scope: ${err.message}`;
                throw new Error(message);
            }
        });
    }
    getTokenAPI(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            let tokenScopeDecoded = scope == UtilModels_1.TokenScope.Dataplane ? this.dataPlaneTokenScope : this.armTokenScope;
            try {
                const cmdArguments = ["account", "get-access-token", "--resource"];
                cmdArguments.push(tokenScopeDecoded);
                var result = yield this.execAz(cmdArguments);
                let token = result.accessToken;
                // NOTE: Setting the subscription id
                this.subscriptionId = result.subscription;
                scope == UtilModels_1.TokenScope.ControlPlane ? this.controlPlaneToken = token : this.dataPlanetoken = token;
                return token;
            }
            catch (err) {
                const message = `An error occurred while getting credentials from ` + `Azure CLI: ${err.message}`;
                throw new Error(message);
            }
        });
    }
    execAz(cmdArguments) {
        return __awaiter(this, void 0, void 0, function* () {
            const azCmd = process.platform === "win32" ? "az.cmd" : "az";
            return new Promise((resolve, reject) => {
                (0, child_process_1.execFile)(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8", shell: true }, (error, stdout) => {
                    if (error) {
                        return reject(error);
                    }
                    try {
                        return resolve(JSON.parse(stdout));
                    }
                    catch (err) {
                        const msg = `An error occurred while parsing the output "${stdout}", of ` +
                            `the cmd az "${cmdArguments}": ${err.message}.`;
                        return reject(new Error(msg));
                    }
                });
            });
        });
    }
    isValid(scope) {
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
    getDataPlaneHeader(apicallType) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValid(UtilModels_1.TokenScope.Dataplane)) {
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
    armTokenHeader() {
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
}
exports.AuthenticationUtils = AuthenticationUtils;
