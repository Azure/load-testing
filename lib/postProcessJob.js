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
exports.run = void 0;
const UtilModels_1 = require("./models/UtilModels");
const CoreUtils = __importStar(require("./Utils/CoreUtils"));
const AuthenticatorService_1 = require("./services/AuthenticatorService");
const util_1 = require("util");
const APIService_1 = require("./services/APIService");
const TaskParametersUtil_1 = require("./Utils/TaskParametersUtil");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const runId = process.env[UtilModels_1.PostTaskParameters.runId];
            const baseUri = process.env[UtilModels_1.PostTaskParameters.baseUri];
            const isRunCompleted = process.env[UtilModels_1.PostTaskParameters.isRunCompleted];
            if (!(0, util_1.isNullOrUndefined)(runId) && !(0, util_1.isNullOrUndefined)(baseUri) && ((0, util_1.isNullOrUndefined)(isRunCompleted) || isRunCompleted != 'true')) {
                console.log("Stopping the test run");
                let taskParameters = yield TaskParametersUtil_1.TaskParametersUtil.getTaskParameters(true);
                const authContext = new AuthenticatorService_1.AuthenticatorService(taskParameters);
                const apiService = new APIService_1.APIService(authContext);
                yield apiService.stopTestRun(baseUri, runId);
                console.log("Stop test-run succesful");
            }
        }
        catch (err) {
            CoreUtils.debug("Failed to stop the test run:" + err.message);
        }
    });
}
exports.run = run;
run();
