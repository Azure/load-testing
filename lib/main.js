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
const util = __importStar(require("./models/FileUtils"));
const UtilModels_1 = require("./models/UtilModels");
const fs = __importStar(require("fs"));
const CoreUtils = __importStar(require("./models/CoreUtils"));
const CreateAndRunTest_1 = require("./models/CreateAndRunTest");
const AuthenticationUtils_1 = require("./models/AuthenticationUtils");
const APIService_1 = require("./models/APIService");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let authContext = new AuthenticationUtils_1.AuthenticationUtils();
            let apiService = new APIService_1.APIService(authContext);
            yield authContext.authorize();
            let dataPlaneUrl = yield apiService.getDataPlaneURL(authContext.resourceId);
            apiService.setBaseURL(dataPlaneUrl);
            CoreUtils.exportVariable(UtilModels_1.PostTaskParameters.baseUri, apiService.baseURL);
            if (fs.existsSync(UtilModels_1.resultFolder)) {
                util.deleteFile(UtilModels_1.resultFolder);
            }
            fs.mkdirSync(UtilModels_1.resultFolder);
            yield (0, CreateAndRunTest_1.createAndRunTest)(apiService);
        }
        catch (err) {
            CoreUtils.setFailed(err.message);
        }
    });
}
run();
