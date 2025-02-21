import { isNullOrUndefined } from "util";
import { TestModel, AppComponents, ExistingParams, PassFailMetric, PassFailServerMetric, SecretMetadata, AppComponentDefinition, InputArtifacts, ServerMetricConfig, TestRunModel } from "./PayloadModels";
import { YamlConfig } from "./TaskModels";
import { ConditionEnumToSignMap, RunTimeParams, ValidConditionsEnumValuesList } from "./UtilModels";
import * as Util from "./util";
import * as InputConstants from "./InputConstants";
import { OutputVariableName } from "./constants";
import * as CoreUtils from './CoreUtils';

export function addExistingParameters(testObj: TestModel, appcomponents: AppComponents | null): ExistingParams {
    let existingParams: ExistingParams = { secrets: {}, env: {}, passFailCriteria: {}, passFailServerMetrics: {}, appComponents: new Map() };
    if(!isNullOrUndefined(testObj.passFailCriteria) && !isNullOrUndefined(testObj.passFailCriteria.passFailMetrics))
        existingParams.passFailCriteria = testObj.passFailCriteria.passFailMetrics;
    if(!isNullOrUndefined(testObj.passFailCriteria) && !isNullOrUndefined(testObj.passFailCriteria.passFailServerMetrics))
        existingParams.passFailServerMetrics = testObj.passFailCriteria.passFailServerMetrics;
    if(!isNullOrUndefined(testObj.secrets)){
        existingParams.secrets = testObj.secrets;
    }
    if(!isNullOrUndefined(testObj.environmentVariables)){
        existingParams.env = testObj.environmentVariables;
    }
    if(appcomponents){
        for(let guid in appcomponents?.components){
            let resourceId = appcomponents.components[guid]?.resourceId ?? "";
            if(existingParams.appComponents.has(resourceId?.toLowerCase())) {
                let existingGuids = existingParams.appComponents.get(resourceId?.toLowerCase()) ?? [];
                existingGuids.push(guid);
                existingParams.appComponents.set(resourceId.toLowerCase(), existingGuids);
            } else {
                existingParams.appComponents.set(resourceId.toLowerCase(), [guid]);
            }
        }
    }
    return existingParams;
}

export function getPayLoadForTest(yamlModel: YamlConfig ,existingParams: ExistingParams) {
    let passFailCriteria = mergePassFailCriteria(yamlModel, existingParams);
    let passFailServerCriteria = mergePassFailServerCriteria(yamlModel, existingParams);
    let secrets = mergeSecrets(yamlModel, existingParams);
    let env = mergeEnv(yamlModel, existingParams);

    let createdata : TestModel = {
        testId: yamlModel.testId,
        description: yamlModel.description,
        displayName: yamlModel.displayName,
        loadTestConfiguration: {
            engineInstances: yamlModel.engineInstances,
            splitAllCSVs: yamlModel.splitAllCSVs,
            regionalLoadTestConfig : yamlModel.regionalLoadTestConfig,
        },
        secrets: secrets,
        kind : yamlModel.kind,
        certificate: yamlModel.certificates,
        environmentVariables: env,
        passFailCriteria:{
            passFailMetrics: passFailCriteria,
            passFailServerMetrics: passFailServerCriteria,
        },
        autoStopCriteria: yamlModel.autoStop,
        subnetId: yamlModel.subnetId,
        publicIPDisabled : yamlModel.publicIPDisabled,
        keyvaultReferenceIdentityType: yamlModel.keyVaultReferenceIdentityType,
        keyvaultReferenceIdentityId: yamlModel.keyVaultReferenceIdentity,
        engineBuiltinIdentityIds: yamlModel.engineReferenceIdentities,
        engineBuiltinIdentityType: yamlModel.engineReferenceIdentityType,
        metricsReferenceIdentityType: yamlModel.metricsReferenceIdentityType,
        metricsReferenceIdentityId: yamlModel.metricsReferenceIdentity
    };

    return createdata;
}

export function getPayloadForAppcomponents(yamlModel: YamlConfig ,existingData:ExistingParams) : AppComponents {
    let appComponentsMerged = yamlModel.appComponents;

    for(let [resourceId, keys] of existingData.appComponents) {
        if(!yamlModel.appComponents.hasOwnProperty(resourceId.toLowerCase())) {
            for(let key of keys) {
                yamlModel.appComponents[key] = null;
            }
        } else {
            for(let key of keys) {
                if(key != null && key != resourceId.toLowerCase()) {
                    yamlModel.appComponents[key] = null;
                }
            }
        }
    }

    let appcomponents = {
        components: appComponentsMerged
    }
    return appcomponents;
}

export function mergeExistingServerCriteria(existingServerCriteria: ServerMetricConfig | null, yamlModel: YamlConfig) {
    let mergedServerCriteria = yamlModel.serverMetricsConfig;
    if(!isNullOrUndefined(existingServerCriteria) && !isNullOrUndefined(existingServerCriteria.metrics)) {
        for(let key in existingServerCriteria.metrics) {
            let resourceId = existingServerCriteria.metrics[key]?.resourceId?.toLowerCase() ?? "";
            if(yamlModel.addDefaultsForAppComponents.hasOwnProperty(resourceId) && !yamlModel.addDefaultsForAppComponents[resourceId] && !yamlModel.serverMetricsConfig.hasOwnProperty(key)) {
                mergedServerCriteria[key] = null;
            } else {
                mergedServerCriteria[key] = existingServerCriteria.metrics[key];
            }
        }
    }
    let serverMetricsConfig = {
        metrics: mergedServerCriteria
    };

    return serverMetricsConfig;
}

export function getAllFileNamesTobeDeleted(yamlModel: YamlConfig, testFiles: InputArtifacts) : string [] {
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
        for(let file of yamlModel.configurationFiles){
            file = Util.getFileName(file);
            let indexOfFile = filesToDelete.indexOf(file);
            if(indexOfFile != -1){
                filesToDelete.splice(indexOfFile, 1);
            }
        }
        for(let file of yamlModel.zipArtifacts){
            file = Util.getFileName(file);
            let indexOfFile = filesToDelete.indexOf(file);
            if(indexOfFile != -1){
                filesToDelete.splice(indexOfFile, 1);
            }
        }
        
    }
    return filesToDelete;
}

export function ValidateAndGetRunTimeParamsForTestRun(testId: string) {
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
            throw new Error(`Invalid format of ${InputConstants.secretsLabel} in the pipeline file. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
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
            throw new Error(`Invalid format of ${InputConstants.envVarsLabel} in the pipeline file. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`); 
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

export function ValidateAndGetOutPutVarName() : string{
    let outputVarName = CoreUtils.getInput(InputConstants.outputVariableName) ?? OutputVariableName; // for now keeping the validations here, later shift to the tasklib class when written.
    let validation = Util.validateOutputParametervariableName(outputVarName);
    if(validation.valid == false) {
        console.log(validation.error);
        throw new Error(`Invalid ${InputConstants.outputVariableNameLabel}. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
    }
    return outputVarName;
}

export function validateAndSetOverRideParams(yamlModel: YamlConfig) : void {
    let overRideParams = CoreUtils.getInput(InputConstants.overRideParameters);

    let validation = Util.validateOverRideParameters(overRideParams);
    if(validation.valid == false) {
        console.log(validation.error);
        throw new Error(`Invalid ${InputConstants.overRideParametersLabel}. Refer to the pipeline syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-configure-load-test-cicd?tabs=pipelines#update-the-azure-pipelines-workflow`);
    }
    if(overRideParams) {
        let overRideParamsObj = JSON.parse(overRideParams);

        if(overRideParamsObj.testId != undefined) {
            yamlModel.testId = overRideParamsObj.testId;
        }
        if(overRideParamsObj.displayName != undefined) {
            yamlModel.displayName = overRideParamsObj.displayName;
        }
        if(overRideParamsObj.description != undefined) {
            yamlModel.description = overRideParamsObj.description;
        }
        if(overRideParamsObj.engineInstances != undefined) {
            yamlModel.engineInstances = overRideParamsObj.engineInstances;
        }
        if(overRideParamsObj.autoStop != undefined) {
            yamlModel.autoStop = yamlModel.getAutoStopCriteria(overRideParamsObj.autoStop);
        }
    }
    return;
}

function mergePassFailCriteria(yamlModel: YamlConfig ,existingData:ExistingParams) : {
    [key: string]: PassFailMetric | null;
} {
    let existingCriteria = existingData.passFailCriteria;
    let existingCriteriaIds = Object.keys(existingCriteria);
    var numberOfExistingCriteria = existingCriteriaIds.length;
    var index = 0;

    let passFailCriteriaMerged = yamlModel.passFailApiModel;
    for(var key in yamlModel.failureCriteria) {
        var splitted = key.split(" ");
        var criteriaId = index < numberOfExistingCriteria ? existingCriteriaIds[index++] : Util.getUniqueId();
        passFailCriteriaMerged[criteriaId] = {
            clientMetric: splitted[0],
            aggregate: splitted[1],
            condition: splitted[2],
            action : splitted[3],
            value: yamlModel.failureCriteria[key],
            requestName: splitted.length > 4 ? splitted.slice(4).join(' ') : null 
        };
    }

    for (; index < numberOfExistingCriteria; index++) {
        passFailCriteriaMerged[existingCriteriaIds[index]] = null;
    }
    return passFailCriteriaMerged;
}
function mergePassFailServerCriteria(yamlModel: YamlConfig ,existingData:ExistingParams) : {
    [key: string]: PassFailServerMetric | null;
} {
    let existingServerCriteria = existingData.passFailServerMetrics;
    let existingServerCriteriaIds = Object.keys(existingServerCriteria);
    let numberOfExistingServerCriteria = existingServerCriteriaIds.length;
    let serverIndex = 0;

    let passFailServerCriteriaMerged = yamlModel.passFailServerModel;
    for(let serverCriteria of yamlModel.serverFailureCriteria) {
        let criteriaId = serverIndex < numberOfExistingServerCriteria ? existingServerCriteriaIds[serverIndex++] : Util.getUniqueId();
        passFailServerCriteriaMerged[criteriaId] = {
            metricName: serverCriteria.metricName,
            aggregation: serverCriteria.aggregation,
            resourceId: serverCriteria.resourceId,
            condition: ConditionEnumToSignMap[serverCriteria.condition as ValidConditionsEnumValuesList ?? ValidConditionsEnumValuesList.LessThan],
            value: serverCriteria.value,
            metricNameSpace: serverCriteria.metricNameSpace ?? Util.getResourceTypeFromResourceId(serverCriteria.resourceId),
        };
    }
    for (; serverIndex < numberOfExistingServerCriteria; serverIndex++) {
        passFailServerCriteriaMerged[existingServerCriteriaIds[serverIndex]] = null;
    }
    return passFailServerCriteriaMerged;
}

function mergeSecrets(yamlModel: YamlConfig ,existingData:ExistingParams): {
    [key: string]: SecretMetadata | null;
} {
    let existingParams = existingData.secrets;
    let secretsMerged = yamlModel.secrets;
    for(var key in existingParams) {
        if(!yamlModel.secrets.hasOwnProperty(key))
            secretsMerged[key] = null;
    }
    return secretsMerged;
}

function mergeEnv(yamlModel: YamlConfig ,existingData:ExistingParams) : {
    [key: string]: string | null;
} {
    let existingEnv = existingData.env;
    let envMerged = yamlModel.env;
    for(var key in existingEnv) {
        if(!yamlModel.env.hasOwnProperty(key)){
            envMerged[key] = null;
        }
    }
    return envMerged;
}