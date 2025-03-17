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
const util = __importStar(require("./Utils/FileUtils"));
const UtilModels_1 = require("./models/UtilModels");
const fs = __importStar(require("fs"));
const CoreUtils = __importStar(require("./Utils/CoreUtils"));
const AuthenticatorService_1 = require("./services/AuthenticatorService");
const CreateAndRunTest_1 = require("./RunnerFiles/CreateAndRunTest");
const APIService_1 = require("./services/APIService");
const TaskParametersUtil_1 = require("./Utils/TaskParametersUtil");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let taskParameters = yield TaskParametersUtil_1.TaskParametersUtil.getTaskParameters();
            let authContext = new AuthenticatorService_1.AuthenticatorService(taskParameters);
            let apiService = new APIService_1.APIService(authContext);
            let dataPlaneUrl = yield apiService.getDataPlaneURL(taskParameters.resourceId);
            apiService.setBaseURL(dataPlaneUrl);
            CoreUtils.exportVariable(UtilModels_1.PostTaskParameters.baseUri, apiService.baseURL);
            if (fs.existsSync(UtilModels_1.resultFolder)) {
                util.deleteFile(UtilModels_1.resultFolder);
            }
            fs.mkdirSync(UtilModels_1.resultFolder);
            let runner = new CreateAndRunTest_1.CreateAndRunTest(apiService);
            runner.createAndRunTest();
        }
        catch (err) {
            CoreUtils.setFailed(err.message);
        }
    });
}
run();
