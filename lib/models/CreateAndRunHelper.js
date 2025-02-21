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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAndSetOverRideParams = exports.ValidateAndGetOutPutVarName = exports.getTestRunPayload = exports.ValidateAndGetRunTimeParamsForTestRun = exports.getAllFileNamesTobeDeleted = exports.mergeExistingServerCriteria = exports.getPayloadForAppcomponents = exports.getPayLoadForTest = exports.addExistingParameters = void 0;
const util_1 = require("util");
const UtilModels_1 = require("./UtilModels");
const Util = __importStar(require("./util"));
const InputConstants = __importStar(require("./InputConstants"));
const constants_1 = require("./constants");
const CoreUtils = __importStar(require("./CoreUtils"));
function addExistingParameters(testObj, appcomponents) {
    var _a, _b, _c;
    let existingParams = { secrets: {}, env: {}, passFailCriteria: {}, passFailServerMetrics: {}, appComponents: new Map() };
    if (!(0, util_1.isNullOrUndefined)(testObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testObj.passFailCriteria.passFailMetrics))
        existingParams.passFailCriteria = testObj.passFailCriteria.passFailMetrics;
    if (!(0, util_1.isNullOrUndefined)(testObj.passFailCriteria) && !(0, util_1.isNullOrUndefined)(testObj.passFailCriteria.passFailServerMetrics))
        existingParams.passFailServerMetrics = testObj.passFailCriteria.passFailServerMetrics;
    if (!(0, util_1.isNullOrUndefined)(testObj.secrets)) {
        existingParams.secrets = testObj.secrets;
    }
    if (!(0, util_1.isNullOrUndefined)(testObj.environmentVariables)) {
        existingParams.env = testObj.environmentVariables;
    }
    if (appcomponents) {
        for (let guid in appcomponents === null || appcomponents === void 0 ? void 0 : appcomponents.components) {
            let resourceId = (_b = (_a = appcomponents.components[guid]) === null || _a === void 0 ? void 0 : _a.resourceId) !== null && _b !== void 0 ? _b : "";
            if (existingParams.appComponents.has(resourceId === null || resourceId === void 0 ? void 0 : resourceId.toLowerCase())) {
                let existingGuids = (_c = existingParams.appComponents.get(resourceId === null || resourceId === void 0 ? void 0 : resourceId.toLowerCase())) !== null && _c !== void 0 ? _c : [];
                existingGuids.push(guid);
                existingParams.appComponents.set(resourceId.toLowerCase(), existingGuids);
            }
            else {
                existingParams.appComponents.set(resourceId.toLowerCase(), [guid]);
            }
        }
    }
    return existingParams;
}
exports.addExistingParameters = addExistingParameters;
function getPayLoadForTest(yamlModel, existingParams) {
    let passFailCriteria = mergePassFailCriteria(yamlModel, existingParams);
    let passFailServerCriteria = mergePassFailServerCriteria(yamlModel, existingParams);
    let secrets = mergeSecrets(yamlModel, existingParams);
    let env = mergeEnv(yamlModel, existingParams);
    let createdata = {
        testId: yamlModel.testId,
        description: yamlModel.description,
        displayName: yamlModel.displayName,
        loadTestConfiguration: {
            engineInstances: yamlModel.engineInstances,
            splitAllCSVs: yamlModel.splitAllCSVs,
            regionalLoadTestConfig: yamlModel.regionalLoadTestConfig,
        },
        secrets: secrets,
        kind: yamlModel.kind,
        certificate: yamlModel.certificates,
        environmentVariables: env,
        passFailCriteria: {
            passFailMetrics: passFailCriteria,
            passFailServerMetrics: passFailServerCriteria,
        },
        autoStopCriteria: yamlModel.autoStop,
        subnetId: yamlModel.subnetId,
        publicIPDisabled: yamlModel.publicIPDisabled,
        keyvaultReferenceIdentityType: yamlModel.keyVaultReferenceIdentityType,
        keyvaultReferenceIdentityId: yamlModel.keyVaultReferenceIdentity,
        engineBuiltinIdentityIds: yamlModel.engineReferenceIdentities,
        engineBuiltinIdentityType: yamlModel.engineReferenceIdentityType,
        metricsReferenceIdentityType: yamlModel.metricsReferenceIdentityType,
        metricsReferenceIdentityId: yamlModel.metricsReferenceIdentity
    };
    return createdata;
}
exports.getPayLoadForTest = getPayLoadForTest;
function getPayloadForAppcomponents(yamlModel, existingData) {
    let appComponentsMerged = yamlModel.appComponents;
    for (let [resourceId, keys] of existingData.appComponents) {
        if (!yamlModel.appComponents.hasOwnProperty(resourceId.toLowerCase())) {
            for (let key of keys) {
                yamlModel.appComponents[key] = null;
            }
        }
        else {
            for (let key of keys) {
                if (key != null && key != resourceId.toLowerCase()) {
                    yamlModel.appComponents[key] = null;
                }
            }
        }
    }
    let appcomponents = {
        components: appComponentsMerged
    };
    return appcomponents;
}
exports.getPayloadForAppcomponents = getPayloadForAppcomponents;
function mergeExistingServerCriteria(existingServerCriteria, yamlModel) {
    var _a, _b, _c;
    let mergedServerCriteria = yamlModel.serverMetricsConfig;
    if (!(0, util_1.isNullOrUndefined)(existingServerCriteria) && !(0, util_1.isNullOrUndefined)(existingServerCriteria.metrics)) {
        for (let key in existingServerCriteria.metrics) {
            let resourceId = (_c = (_b = (_a = existingServerCriteria.metrics[key]) === null || _a === void 0 ? void 0 : _a.resourceId) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : "";
            if (yamlModel.addDefaultsForAppComponents.hasOwnProperty(resourceId) && !yamlModel.addDefaultsForAppComponents[resourceId] && !yamlModel.serverMetricsConfig.hasOwnProperty(key)) {
                mergedServerCriteria[key] = null;
            }
            else {
                mergedServerCriteria[key] = existingServerCriteria.metrics[key];
            }
        }
    }
    let serverMetricsConfig = {
        metrics: mergedServerCriteria
    };
    return serverMetricsConfig;
}
exports.mergeExistingServerCriteria = mergeExistingServerCriteria;
function getAllFileNamesTobeDeleted(yamlModel, testFiles) {
    let filesToDelete = [];
    if (testFiles.userPropFileInfo != null) {
        filesToDelete.push(testFiles.userPropFileInfo.fileName);
    }
    if (!(0, util_1.isNullOrUndefined)(testFiles.additionalFileInfo)) {
        // delete existing files which are not present in yaml, the files which are in yaml will anyway be uploaded again.
        let file;
        for (file of testFiles.additionalFileInfo) {
            filesToDelete.push(file.fileName);
        }
        for (let file of yamlModel.configurationFiles) {
            file = Util.getFileName(file);
            let indexOfFile = filesToDelete.indexOf(file);
            if (indexOfFile != -1) {
                filesToDelete.splice(indexOfFile, 1);
            }
        }
        for (let file of yamlModel.zipArtifacts) {
            file = Util.getFileName(file);
            let indexOfFile = filesToDelete.indexOf(file);
            if (indexOfFile != -1) {
                filesToDelete.splice(indexOfFile, 1);
            }
        }
    }
    return filesToDelete;
}
exports.getAllFileNamesTobeDeleted = getAllFileNamesTobeDeleted;
function ValidateAndGetRunTimeParamsForTestRun(testId) {
    var _a, _b;
    var secretRun = CoreUtils.getInput(InputConstants.secrets);
    let secretsParsed = {};
    let envParsed = {};
    if (secretRun) {
        try {
            var obj = JSON.parse(secretRun);
            for (var index in obj) {
                var val = obj[index];
                let str = `name : ${val.name}, value : ${val.value}`;
                if ((0, util_1.isNullOrUndefined)(val.name)) {
                    throw new Error(`Invalid secret name at pipeline parameters at ${str}`);
                }
                secretsParsed[val.name] = { type: 'SECRET_VALUE', value: val.value };
            }
        }
        catch (error) {
            console.log(error);
            throw new Error(`Invalid format of ${InputConstants.secretsLabel} in the pipeline file. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
        }
    }
    var eRun = CoreUtils.getInput(InputConstants.envVars);
    if (eRun) {
        try {
            var obj = JSON.parse(eRun);
            for (var index in obj) {
                var val = obj[index];
                let str = `name : ${val.name}, value : ${val.value}`;
                if ((0, util_1.isNullOrUndefined)(val.name)) {
                    throw new Error(`Invalid environment name at pipeline parameters at ${str}`);
                }
                envParsed[val.name] = val.value;
            }
        }
        catch (error) {
            console.log(error);
            throw new Error(`Invalid format of ${InputConstants.envVarsLabel} in the pipeline file. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
        }
    }
    const runDisplayName = (_a = CoreUtils.getInput(InputConstants.testRunName)) !== null && _a !== void 0 ? _a : Util.getDefaultTestRunName();
    const runDescription = (_b = CoreUtils.getInput(InputConstants.runDescription)) !== null && _b !== void 0 ? _b : Util.getDefaultRunDescription();
    let runTimeParams = { env: envParsed, secrets: secretsParsed, runDisplayName, runDescription, testId: '', testRunId: '' };
    Util.validateTestRunParamsFromPipeline(runTimeParams);
    runTimeParams.testRunId = Util.getUniqueId();
    runTimeParams.testId = testId;
    return runTimeParams;
}
exports.ValidateAndGetRunTimeParamsForTestRun = ValidateAndGetRunTimeParamsForTestRun;
function getTestRunPayload(runTimeParams) {
    let testRunPayload = {
        environmentVariables: runTimeParams.env,
        secrets: runTimeParams.secrets,
        displayName: runTimeParams.runDisplayName,
        description: runTimeParams.runDescription,
        testId: runTimeParams.testId,
        testRunId: runTimeParams.testRunId
    };
    return testRunPayload;
}
exports.getTestRunPayload = getTestRunPayload;
function ValidateAndGetOutPutVarName() {
    var _a;
    let outputVarName = (_a = CoreUtils.getInput(InputConstants.outputVariableName)) !== null && _a !== void 0 ? _a : constants_1.OutputVariableName; // for now keeping the validations here, later shift to the tasklib class when written.
    let validation = Util.validateOutputParametervariableName(outputVarName);
    if (validation.valid == false) {
        console.log(validation.error);
        throw new Error(`Invalid ${InputConstants.outputVariableNameLabel}. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
    }
    return outputVarName;
}
exports.ValidateAndGetOutPutVarName = ValidateAndGetOutPutVarName;
function validateAndSetOverRideParams(yamlModel) {
    let overRideParams = CoreUtils.getInput(InputConstants.overRideParameters);
    let validation = Util.validateOverRideParameters(overRideParams);
    if (validation.valid == false) {
        console.log(validation.error);
        throw new Error(`Invalid ${InputConstants.overRideParametersLabel}. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
    }
    if (overRideParams) {
        let overRideParamsObj = JSON.parse(overRideParams);
        if (overRideParamsObj.testId != undefined) {
            yamlModel.testId = overRideParamsObj.testId;
        }
        if (overRideParamsObj.displayName != undefined) {
            yamlModel.displayName = overRideParamsObj.displayName;
        }
        if (overRideParamsObj.description != undefined) {
            yamlModel.description = overRideParamsObj.description;
        }
        if (overRideParamsObj.engineInstances != undefined) {
            yamlModel.engineInstances = overRideParamsObj.engineInstances;
        }
        if (overRideParamsObj.autoStop != undefined) {
            yamlModel.autoStop = yamlModel.getAutoStopCriteria(overRideParamsObj.autoStop);
        }
    }
    return;
}
exports.validateAndSetOverRideParams = validateAndSetOverRideParams;
function mergePassFailCriteria(yamlModel, existingData) {
    let existingCriteria = existingData.passFailCriteria;
    let existingCriteriaIds = Object.keys(existingCriteria);
    var numberOfExistingCriteria = existingCriteriaIds.length;
    var index = 0;
    let passFailCriteriaMerged = yamlModel.passFailApiModel;
    for (var key in yamlModel.failureCriteria) {
        var splitted = key.split(" ");
        var criteriaId = index < numberOfExistingCriteria ? existingCriteriaIds[index++] : Util.getUniqueId();
        passFailCriteriaMerged[criteriaId] = {
            clientMetric: splitted[0],
            aggregate: splitted[1],
            condition: splitted[2],
            action: splitted[3],
            value: yamlModel.failureCriteria[key],
            requestName: splitted.length > 4 ? splitted.slice(4).join(' ') : null
        };
    }
    for (; index < numberOfExistingCriteria; index++) {
        passFailCriteriaMerged[existingCriteriaIds[index]] = null;
    }
    return passFailCriteriaMerged;
}
function mergePassFailServerCriteria(yamlModel, existingData) {
    var _a, _b;
    let existingServerCriteria = existingData.passFailServerMetrics;
    let existingServerCriteriaIds = Object.keys(existingServerCriteria);
    let numberOfExistingServerCriteria = existingServerCriteriaIds.length;
    let serverIndex = 0;
    let passFailServerCriteriaMerged = yamlModel.passFailServerModel;
    for (let serverCriteria of yamlModel.serverFailureCriteria) {
        let criteriaId = serverIndex < numberOfExistingServerCriteria ? existingServerCriteriaIds[serverIndex++] : Util.getUniqueId();
        passFailServerCriteriaMerged[criteriaId] = {
            metricName: serverCriteria.metricName,
            aggregation: serverCriteria.aggregation,
            resourceId: serverCriteria.resourceId,
            condition: UtilModels_1.ConditionEnumToSignMap[(_a = serverCriteria.condition) !== null && _a !== void 0 ? _a : UtilModels_1.ValidConditionsEnumValuesList.LessThan],
            value: serverCriteria.value,
            metricNameSpace: (_b = serverCriteria.metricNameSpace) !== null && _b !== void 0 ? _b : Util.getResourceTypeFromResourceId(serverCriteria.resourceId),
        };
    }
    for (; serverIndex < numberOfExistingServerCriteria; serverIndex++) {
        passFailServerCriteriaMerged[existingServerCriteriaIds[serverIndex]] = null;
    }
    return passFailServerCriteriaMerged;
}
function mergeSecrets(yamlModel, existingData) {
    let existingParams = existingData.secrets;
    let secretsMerged = yamlModel.secrets;
    for (var key in existingParams) {
        if (!yamlModel.secrets.hasOwnProperty(key))
            secretsMerged[key] = null;
    }
    return secretsMerged;
}
function mergeEnv(yamlModel, existingData) {
    let existingEnv = existingData.env;
    let envMerged = yamlModel.env;
    for (var key in existingEnv) {
        if (!yamlModel.env.hasOwnProperty(key)) {
            envMerged[key] = null;
        }
    }
    return envMerged;
}
