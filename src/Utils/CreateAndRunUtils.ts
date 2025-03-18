import { isNullOrUndefined } from "util";
import { TestModel, AppComponents, ExistingParams, PassFailMetric, PassFailServerMetric, SecretMetadata, InputArtifacts, ServerMetricConfig, TestRunModel } from "../models/PayloadModels";
import { ConditionEnumToSignMap, RunTimeParams, ValidConditionsEnumValuesList } from "../models/UtilModels";
import * as Util from "./CommonUtils";
import * as InputConstants from "../Constants/InputConstants";
import { OutputVariableName, OverRideParametersModel } from "../Constants/GeneralConstants";
import * as CoreUtils from './CoreUtils';
import { LoadtestConfig } from "../models/LoadtestConfig";
import { LoadtestConfigUtil } from "./LoadtestConfigUtil";

export function addExistingTestParameters(testObj: TestModel, existingParams: ExistingParams) {
    if(!isNullOrUndefined(testObj.passFailCriteria) && !isNullOrUndefined(testObj.passFailCriteria.passFailMetrics)) {
        existingParams.passFailCriteria = testObj.passFailCriteria.passFailMetrics;
    }

    if(!isNullOrUndefined(testObj.passFailCriteria) && !isNullOrUndefined(testObj.passFailCriteria.passFailServerMetrics)) {
        existingParams.passFailServerMetrics = testObj.passFailCriteria.passFailServerMetrics;
    }

    if(!isNullOrUndefined(testObj.secrets)){
        existingParams.secrets = testObj.secrets;
    }

    if(!isNullOrUndefined(testObj.environmentVariables)){
        existingParams.env = testObj.environmentVariables;
    }
}

export function addExistingAppComponentParameters(appcomponents: AppComponents | null, existingParams: ExistingParams) {
    if(appcomponents){
        for(let guid in appcomponents?.components){
            let resourceId = appcomponents.components[guid]?.resourceId ?? "";

            if(existingParams.appComponents.has(resourceId?.toLowerCase())) {
                let existingGuids = existingParams.appComponents.get(resourceId?.toLowerCase()) ?? [];
                existingGuids.push(guid);
                existingParams.appComponents.set(resourceId.toLowerCase(), existingGuids);
            } 
            else {
                existingParams.appComponents.set(resourceId.toLowerCase(), [guid]);
            }
        }
    }
}

export function getPayloadForTest(loadTestConfig: LoadtestConfig, existingParams: ExistingParams) {
    let passFailCriteria = mergePassFailCriteria(loadTestConfig, existingParams);
    let passFailServerCriteria = mergePassFailServerCriteria(loadTestConfig, existingParams);
    let secrets = mergeSecrets(loadTestConfig, existingParams);
    let env = mergeEnv(loadTestConfig, existingParams);

    let createdata : TestModel = {
        testId: loadTestConfig.testId,
        description: loadTestConfig.description,
        displayName: loadTestConfig.displayName,
        loadTestConfiguration: {
            engineInstances: loadTestConfig.engineInstances,
            splitAllCSVs: loadTestConfig.splitAllCSVs,
            regionalLoadTestConfig : loadTestConfig.regionalLoadTestConfig,
        },
        secrets: secrets,
        kind : loadTestConfig.kind,
        certificate: loadTestConfig.certificates,
        environmentVariables: env,
        passFailCriteria:{
            passFailMetrics: passFailCriteria,
            passFailServerMetrics: passFailServerCriteria,
        },
        autoStopCriteria: loadTestConfig.autoStop,
        subnetId: loadTestConfig.subnetId,
        publicIPDisabled : loadTestConfig.publicIPDisabled,
        keyvaultReferenceIdentityType: loadTestConfig.keyVaultReferenceIdentityType,
        keyvaultReferenceIdentityId: loadTestConfig.keyVaultReferenceIdentity,
        engineBuiltinIdentityIds: loadTestConfig.engineReferenceIdentities,
        engineBuiltinIdentityType: loadTestConfig.engineReferenceIdentityType,
        metricsReferenceIdentityType: loadTestConfig.metricsReferenceIdentityType,
        metricsReferenceIdentityId: loadTestConfig.metricsReferenceIdentity
    };

    return createdata;
}

export function getPayloadForAppcomponents(loadTestConfig: LoadtestConfig, existingData:ExistingParams) : AppComponents {
    let appComponentsMerged = loadTestConfig.appComponents;

    for(let [resourceId, keys] of existingData.appComponents) {
        if(!loadTestConfig.appComponents.hasOwnProperty(resourceId.toLowerCase())) {
            for(let key of keys) {
                !loadTestConfig.appComponents.hasOwnProperty(key) && (loadTestConfig.appComponents[key] = null);
            }
        } else {
            for(let key of keys) {
                if(key != null && key != resourceId.toLowerCase()) {
                    !loadTestConfig.appComponents.hasOwnProperty(key) && (loadTestConfig.appComponents[key] = null);
                }
            }
        }
    }

    let appcomponents = {
        components: appComponentsMerged
    }
    return appcomponents;
}

export function getPayloadForServerMetricsConfig(existingServerCriteria: ServerMetricConfig | null, loadTestConfig: LoadtestConfig) {
    let mergedServerCriteria = loadTestConfig.serverMetricsConfig;
    if(!isNullOrUndefined(existingServerCriteria) && !isNullOrUndefined(existingServerCriteria.metrics)) {
        for(let key in existingServerCriteria.metrics) {
            let resourceId = existingServerCriteria.metrics[key]?.resourceId?.toLowerCase() ?? "";
            if(loadTestConfig.addDefaultsForAppComponents.hasOwnProperty(resourceId) && !loadTestConfig.addDefaultsForAppComponents[resourceId] && !loadTestConfig.serverMetricsConfig.hasOwnProperty(key)) {
                mergedServerCriteria[key] = null;
            }
        }
    }
    let serverMetricsConfig = {
        metrics: mergedServerCriteria
    };

    return serverMetricsConfig;
}

export function getAllFileNamesTobeDeleted(loadTestConfig: LoadtestConfig, testFiles: InputArtifacts) : string [] {
    let filesToDelete : string[] = [];

    if(testFiles.userPropFileInfo != null){
        filesToDelete.push(testFiles.userPropFileInfo.fileName);
    }

    if(!isNullOrUndefined(testFiles.additionalFileInfo)){
        // delete existing files which are not present in yaml, the files which are in yaml will anyway be uploaded again.
        let file : any;
        for(file of testFiles.additionalFileInfo){
            filesToDelete.push(file.fileName);
        }
        for(let file of loadTestConfig.configurationFiles){
            file = Util.getFileName(file);
            let indexOfFile = filesToDelete.indexOf(file);
            if(indexOfFile != -1){
                filesToDelete.splice(indexOfFile, 1);
            }
        }
        for(let file of loadTestConfig.zipArtifacts){
            file = Util.getFileName(file);
            let indexOfFile = filesToDelete.indexOf(file);
            if(indexOfFile != -1){
                filesToDelete.splice(indexOfFile, 1);
            }
        }
        
    }
    return filesToDelete;
}

export function validateAndGetRunTimeParamsForTestRun(testId: string) {
    var secretRun = CoreUtils.getInput(InputConstants.secrets);
    let secretsParsed : {[key: string] : SecretMetadata} = {};
    let envParsed : {[key: string] : string} = {};
    if(secretRun) {
        try {
            var obj = JSON.parse(secretRun);
            for (var index in obj) {
                var val = obj[index];
                let str : string =  `name : ${val.name}, value : ${val.value}`;
                if(isNullOrUndefined(val.name)){
                    throw new Error(`Invalid secret name at pipeline parameters at ${str}`);
                }
                secretsParsed[val.name] = {type: 'SECRET_VALUE',value: val.value};
            }
        }
        catch (error) {
            console.log(error);
            throw new Error(`Invalid format of ${InputConstants.secretsLabel} in the pipeline file. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=github#update-the-azure-pipelines-workflow`);
        }
    }
    var eRun = CoreUtils.getInput(InputConstants.envVars);
    if(eRun) {
        try {
            var obj = JSON.parse(eRun);
            for (var index in obj) {
                var val = obj[index];
                let str : string =  `name : ${val.name}, value : ${val.value}`;
                if(isNullOrUndefined(val.name)){
                    throw new Error(`Invalid environment name at pipeline parameters at ${str}`);
                }
                envParsed[val.name] = val.value;
            }
        }
        catch (error) {
            console.log(error);
            throw new Error(`Invalid format of ${InputConstants.envVarsLabel} in the pipeline file. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=github#update-the-azure-pipelines-workflow`); 
        }
    }
    const runDisplayName = CoreUtils.getInput(InputConstants.testRunName) ?? Util.getDefaultTestRunName();
    const runDescription = CoreUtils.getInput(InputConstants.runDescription) ?? Util.getDefaultRunDescription();
    
    let runTimeParams : RunTimeParams = {env: envParsed, secrets: secretsParsed, runDisplayName, runDescription, testId: '', testRunId: ''};
    Util.validateTestRunParamsFromPipeline(runTimeParams);
    runTimeParams.testRunId = Util.getUniqueId();
    runTimeParams.testId = testId;

    return runTimeParams;
}

export function getTestRunPayload(runTimeParams : RunTimeParams) : TestRunModel {
    let testRunPayload : TestRunModel = {
        environmentVariables : runTimeParams.env,
        secrets: runTimeParams.secrets,
        displayName: runTimeParams.runDisplayName,
        description: runTimeParams.runDescription,
        testId: runTimeParams.testId,
        testRunId: runTimeParams.testRunId
    };
    return testRunPayload;
}

export function validateAndGetOutPutVarName() : string{
    let outputVarName = CoreUtils.getInput(InputConstants.outputVariableName) ?? OutputVariableName; // for now keeping the validations here, later shift to the tasklib class when written.
    let validation = Util.validateOutputParametervariableName(outputVarName);
    if(validation.valid == false) {
        console.log(validation.error);
        throw new Error(`Invalid ${InputConstants.outputVariableNameLabel}. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=github#update-the-azure-pipelines-workflow`);
    }
    return outputVarName;
}

export function validateAndSetOverrideParams(loadTestConfig: LoadtestConfig) : void {
    let overRideParams = CoreUtils.getInput(InputConstants.overRideParameters);

    let validation = Util.validateOverRideParameters(overRideParams);
    if(validation.valid == false) {
        console.log(validation.error);
        throw new Error(`Invalid ${InputConstants.overRideParametersLabel}. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=github#update-the-azure-pipelines-workflow`);
    }
    if(overRideParams) {
        let overRideParamsObj = JSON.parse(overRideParams) as OverRideParametersModel;

        if(overRideParamsObj.testId != undefined) {
            loadTestConfig.testId = overRideParamsObj.testId.toLowerCase();
        }
        if(overRideParamsObj.displayName != undefined) {
            loadTestConfig.displayName = overRideParamsObj.displayName;
        }
        if(overRideParamsObj.description != undefined) {
            loadTestConfig.description = overRideParamsObj.description;
        }
        if(overRideParamsObj.engineInstances != undefined) {
            loadTestConfig.engineInstances = overRideParamsObj.engineInstances;
        }
        if(overRideParamsObj.autoStop != undefined) {
            loadTestConfig.autoStop = LoadtestConfigUtil.getAutoStopCriteria(overRideParamsObj.autoStop);
        }
    }
}

function mergePassFailCriteria(loadTestConfig: LoadtestConfig, existingData:ExistingParams) : {
    [key: string]: PassFailMetric | null;
} {
    let existingCriteria = existingData.passFailCriteria;
    let existingCriteriaIds = Object.keys(existingCriteria);
    var numberOfExistingCriteria = existingCriteriaIds.length;
    var index = 0;

    let passFailCriteriaMerged : { [key: string]: PassFailMetric | null } = {};

    if (!isNullOrUndefined(loadTestConfig.failureCriteria)) {
        for(var key in loadTestConfig.failureCriteria) {
            var splitted = key.split(" ");
            var criteriaId = index < numberOfExistingCriteria ? existingCriteriaIds[index++] : Util.getUniqueId();
            passFailCriteriaMerged[criteriaId] = {
                clientMetric: splitted[0],
                aggregate: splitted[1],
                condition: splitted[2],
                action : splitted[3],
                value: loadTestConfig.failureCriteria[key],
                requestName: splitted.length > 4 ? splitted.slice(4).join(' ') : null 
            };
        }
    }

    for (; index < numberOfExistingCriteria; index++) {
        passFailCriteriaMerged[existingCriteriaIds[index]] = null;
    }
    return passFailCriteriaMerged;
}
function mergePassFailServerCriteria(loadTestConfig: LoadtestConfig ,existingData:ExistingParams) : {
    [key: string]: PassFailServerMetric | null;
} {
    let existingServerCriteria = existingData.passFailServerMetrics;
    let existingServerCriteriaIds = Object.keys(existingServerCriteria);
    let numberOfExistingServerCriteria = existingServerCriteriaIds.length;
    let serverIndex = 0;

    let passFailServerCriteriaMerged : { [key: string]: PassFailServerMetric | null } = {};

    if (!isNullOrUndefined(loadTestConfig.serverFailureCriteria)) {
        for(let serverCriteria of loadTestConfig.serverFailureCriteria) {
            let criteriaId = serverIndex < numberOfExistingServerCriteria ? existingServerCriteriaIds[serverIndex++] : Util.getUniqueId();
            passFailServerCriteriaMerged[criteriaId] = {
                metricName: serverCriteria.metricName,
                aggregation: serverCriteria.aggregation,
                resourceId: serverCriteria.resourceId,
                condition: ConditionEnumToSignMap[serverCriteria.condition as ValidConditionsEnumValuesList ?? ValidConditionsEnumValuesList.LessThan],
                value: serverCriteria.value?.toString(),
                metricNameSpace: serverCriteria.metricNameSpace ?? Util.getResourceTypeFromResourceId(serverCriteria.resourceId),
            };
        }
    }

    for (; serverIndex < numberOfExistingServerCriteria; serverIndex++) {
        passFailServerCriteriaMerged[existingServerCriteriaIds[serverIndex]] = null;
    }

    return passFailServerCriteriaMerged;
}

function mergeSecrets(loadTestConfig: LoadtestConfig ,existingData:ExistingParams): {
    [key: string]: SecretMetadata | null;
} {
    let existingParams = existingData.secrets;
    let secretsMerged = loadTestConfig.secrets;
    for(var key in existingParams) {
        if(!loadTestConfig.secrets.hasOwnProperty(key))
            secretsMerged[key] = null;
    }
    return secretsMerged;
}

function mergeEnv(loadTestConfig: LoadtestConfig ,existingData:ExistingParams) : {
    [key: string]: string | null;
} {
    let existingEnv = existingData.env;
    let envMerged = loadTestConfig.environmentVariables;
    for(var key in existingEnv) {
        if(!loadTestConfig.environmentVariables.hasOwnProperty(key)){
            envMerged[key] = null;
        }
    }
    return envMerged;
}