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
exports.TaskParametersUtil = void 0;
const util_1 = require("util");
const CoreUtils = __importStar(require("./CoreUtils"));
const InputConstants = __importStar(require("../Constants/InputConstants"));
const EnvironmentConstants = __importStar(require("../Constants/EnvironmentConstants"));
const AzCliUtility = __importStar(require("../Utils/AzCliUtility"));
class TaskParametersUtil {
    static getTaskParameters() {
        return __awaiter(this, arguments, void 0, function* (isPostProcessJob = false) {
            let taskParameters = {
                subscriptionId: '',
                subscriptionName: '',
                environment: EnvironmentConstants.AzurePublicCloud.cloudName,
                armTokenScope: EnvironmentConstants.AzurePublicCloud.armTokenScope,
                dataPlaneTokenScope: EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope,
                resourceId: '',
                armEndpoint: EnvironmentConstants.AzurePublicCloud.armEndpoint,
            };
            // Post process job does not require resource parameters
            if (!isPostProcessJob) {
                yield this.setSubscriptionParameters(taskParameters);
                this.setResourceParameters(taskParameters);
            }
            yield this.setEndpointAndScopeParameters(taskParameters);
            return taskParameters;
        });
    }
    static setResourceParameters(taskParameters) {
        const resourceGroup = CoreUtils.getInput(InputConstants.resourceGroup);
        const loadTestResourceName = CoreUtils.getInput(InputConstants.loadTestResource);
        if ((0, util_1.isNullOrUndefined)(resourceGroup) || resourceGroup == '') {
            throw new Error(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
        }
        if ((0, util_1.isNullOrUndefined)(loadTestResourceName) || loadTestResourceName == '') {
            throw new Error(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
        }
        taskParameters.resourceId = "/subscriptions/" + taskParameters.subscriptionId + "/resourcegroups/" + resourceGroup + "/providers/microsoft.loadtestservice/loadtests/" + loadTestResourceName;
    }
    static setSubscriptionParameters(taskParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cmdArguments = ["account", "show"];
                var result = yield AzCliUtility.execAz(cmdArguments);
                taskParameters.subscriptionId = result.id;
                taskParameters.subscriptionName = result.name;
            }
            catch (err) {
                const message = `An error occurred while getting credentials from ` +
                    `Azure CLI for getting subscription name: ${err.message}`;
                throw new Error(message);
            }
        });
    }
    static setEndpointAndScopeParameters(taskParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const cmdArguments = ["cloud", "show"];
                var result = yield AzCliUtility.execAz(cmdArguments);
                let env = result ? result.name : null;
                taskParameters.environment = env !== null && env !== void 0 ? env : EnvironmentConstants.AzurePublicCloud.cloudName;
                let endpointUrl = (result && result.endpoints) ? result.endpoints.resourceManager : null;
                taskParameters.armEndpoint = endpointUrl !== null && endpointUrl !== void 0 ? endpointUrl : taskParameters.armEndpoint;
                if (taskParameters.environment.toLowerCase() == EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toLowerCase()) {
                    taskParameters.dataPlaneTokenScope = EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope;
                    taskParameters.armTokenScope = EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope;
                }
            }
            catch (err) {
                const message = `An error occurred while getting credentials from ` +
                    `Azure CLI for setting endPoint and scope: ${err.message}`;
                throw new Error(message);
            }
        });
    }
}
exports.TaskParametersUtil = TaskParametersUtil;
