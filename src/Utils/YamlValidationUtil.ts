import { isNull, isNullOrUndefined } from "util";
import { ManagedIdentityType, ReferenceIdentityKinds, ValidationModel, ValidConditionsEnumValuesList, ValidCriteriaTypes } from "../models/UtilModels";
import { checkFileType, checkFileTypes, getResourceGroupFromResourceId, getResourceNameFromResourceId, getResourceTypeFromResourceId, getSubscriptionIdFromResourceId, invalidDescription, invalidDisplayName, inValidEngineInstances, invalidName, validateAndGetSegregatedManagedIdentities, validateAutoStop } from "./CommonUtils";
import * as EngineUtil from './EngineUtil';
import { TestKind } from "../models/TestKind";
import { BaseLoadTestFrameworkModel } from "../models/engine/BaseLoadTestFrameworkModel";
import { YamlConfig } from "../models/YamlConfig";

export function validateYamlConfig(givenYaml : any) : ValidationModel {
    if(!isDictionary(givenYaml)) {
        return {valid : false,error :`Invalid YAML syntax.`};
    }
    
    let unSupportedKeys : string[] = [];
    let supportedKeys : string[] = Object.keys(new YamlConfig());

    unSupportedKeys = Object.keys(givenYaml).filter(element => supportedKeys.indexOf(element) == -1);

    if(unSupportedKeys.length) {
        const result = unSupportedKeys.map(element => `${element}`).join(", ");
        return {valid : false, error : `The YAML file provided has unsupported field(s) "${result}".`};
    }
    if(isNullOrUndefined(givenYaml.testName) && isNullOrUndefined(givenYaml.testId)){
        return {valid : false, error : "The required field testId is missing in the load test YAML file."};
    }
    let testId = '';
    if(!isNullOrUndefined(givenYaml.testName)){
        testId = givenYaml.testName;
    }
    if(!isNullOrUndefined(givenYaml.testId)){
        testId = givenYaml.testId;
    }
    testId = testId.toLowerCase();
    if(typeof(testId) != "string" || invalidName(testId)){
        return {valid : false, error : `The value "${testId}" for testId is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.`};
    }
    if(givenYaml.displayName && (typeof givenYaml.displayName != 'string' || invalidDisplayName(givenYaml.displayName))){
        return {valid : false, error : `The value "${givenYaml.displayName}" for displayName is invalid. Display name must be a string of length between 2 to 50.`};
    }
    if(givenYaml.description && (typeof givenYaml.description != 'string' || invalidDescription(givenYaml.description))){
        return {valid : false, error : `The value "${givenYaml.description}" for description is invalid. Description must be a string of length less than 100.`};
    }
    if(isNullOrUndefined(givenYaml.testPlan)){
        return {valid : false, error : "The required field testPlan is missing in the load test YAML file."};
    }
    if(givenYaml.engineInstances && (isNaN(givenYaml.engineInstances) || inValidEngineInstances(givenYaml.engineInstances))){
        return {valid : false, error : `The value "${givenYaml.engineInstances}" for engineInstances is invalid. The value should be an integer between 1 and 400.`};
    }
    
    let kind : TestKind = givenYaml.testType ?? TestKind.JMX;
    
    if(!isValidTestKind(kind)){
        return {valid : false, error : `The value "${kind}" for testType is invalid. Acceptable values are ${EngineUtil.Resources.Strings.allFrameworksFriendly}.`};
    }
    
    let framework : BaseLoadTestFrameworkModel = EngineUtil.getLoadTestFrameworkModelFromKind(kind);
    if(givenYaml.testType as TestKind == TestKind.URL){
        if(!checkFileType(givenYaml.testPlan,'json')) {
            return {valid : false, error : "The testPlan for a URL test should of type \"json\"."};
        }
    }
    else if(!checkFileType(givenYaml.testPlan, framework.testScriptFileExtension)) {
        return {valid : false, error : `The testPlan for a ${kind} test should of type "${framework.testScriptFileExtension}".`};
    }
    if(givenYaml.subnetId && (typeof givenYaml.subnetId!= 'string' || isInValidSubnet(givenYaml.subnetId))){
        return {valid : false, error : `The value "${givenYaml.subnetId}" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".`};
    }
    if(givenYaml.keyVaultReferenceIdentity && (typeof givenYaml.keyVaultReferenceIdentity!= 'string' || isInvalidManagedIdentityId(givenYaml.keyVaultReferenceIdentity))){
        return {valid : false, error : `The value "${givenYaml.keyVaultReferenceIdentity}" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".`};
    }
    if(givenYaml.keyVaultReferenceIdentityType != undefined && givenYaml.keyVaultReferenceIdentityType != null && !isValidManagedIdentityType(givenYaml.keyVaultReferenceIdentityType)){
        return {valid : false, error : `The value "${givenYaml.keyVaultReferenceIdentityType}" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
    }

    if(!isNullOrUndefined(givenYaml.referenceIdentities)) {
        if(!Array.isArray(givenYaml.referenceIdentities)){
            return {valid : false, error : `The value "${givenYaml.referenceIdentities.toString()}" for referenceIdentities is invalid. Provide a valid list of reference identities.`};
        }
        let result = validateReferenceIdentities(givenYaml.referenceIdentities);
        if(result?.valid == false){
            return result;
        }
        try {
            if(givenYaml.keyVaultReferenceIdentityType || givenYaml.keyVaultReferenceIdentity){
                validateAndGetSegregatedManagedIdentities(givenYaml.referenceIdentities as Array<{[key: string] : string}>, true);
            } else {
                validateAndGetSegregatedManagedIdentities(givenYaml.referenceIdentities as Array<{[key: string] : string}>);
            }
        } catch (error : any) {
            return {valid : false, error : error.message};
        }
    }

    if(!isNullOrUndefined(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == ManagedIdentityType.SystemAssigned){
        return {valid : false, error : `The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.`};
    }
    if(isNullOrUndefined(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == ManagedIdentityType.UserAssigned){
        return {valid : false, error : `"The value for 'keyVaultReferenceIdentity' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'keyVaultReferenceIdentity'."`};
    }
    if(givenYaml.publicIPDisabled && typeof givenYaml.publicIPDisabled!= 'boolean'){
        return {valid : false, error : `The value "${givenYaml.publicIPDisabled}" for publicIPDisabled is invalid. The value should be either true or false.`};
    }
    if(givenYaml.publicIPDisabled && isNullOrUndefined(givenYaml.subnetId)){
        return {valid : false, error : `Public IP deployment can only be disabled for tests against private endpoints. For public endpoints, set publicIPDisabled to False.`}
    }
    if(givenYaml.configurationFiles && !isArrayOfStrings(givenYaml.configurationFiles)){
        return {valid : false, error : `The value "${givenYaml.configurationFiles}" for configurationFiles is invalid. Provide a valid list of strings.`};
    }
    if(givenYaml.zipArtifacts && !isArrayOfStrings(givenYaml.zipArtifacts)){
        return {valid : false, error : `The value "${givenYaml.zipArtifacts}" for zipArtifacts is invalid. Provide a valid list of strings.`};
    }
    if(givenYaml.splitAllCSVs && typeof givenYaml.splitAllCSVs!= 'boolean'){
        return {valid : false, error : `The value "${givenYaml.splitAllCSVs}" for splitAllCSVs is invalid. The value should be either true or false`};
    }
    if(givenYaml.properties != undefined && givenYaml.properties.userPropertyFile != undefined){
        if(isNull(givenYaml.properties.userPropertyFile) || typeof givenYaml.properties.userPropertyFile != 'string' || !checkFileTypes(givenYaml.properties.userPropertyFile, framework.userPropertyFileExtensions)){
            return {valid : false, error : `The value "${givenYaml.properties.userPropertyFile}" for userPropertyFile is invalid. Provide a valid file path of type ${framework.ClientResources.userPropertyFileExtensionsFriendly}. Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`}
        }
    }
    if(givenYaml.appComponents) {
        if(!Array.isArray(givenYaml.appComponents)){
            return {valid : false, error : `The value "${givenYaml.appComponents}" for appComponents is invalid. Provide a valid list of application components.`};
        }
        let validationAppComponents = validateAppComponentAndServerMetricsConfig(givenYaml.appComponents);
        if(validationAppComponents.valid == false){
            return validationAppComponents;
        }
    }
    if(givenYaml.autoStop){
        let validation = validateAutoStop(givenYaml.autoStop);
        if(validation.valid == false){
            return validation;
        }
    }
    if(givenYaml.failureCriteria != undefined) {
        let result = validateFailureCriteria(givenYaml.failureCriteria);
        if(result.valid == false){
            return result;
        }
    }
    if(givenYaml.regionalLoadTestConfig){
        if(!Array.isArray(givenYaml.regionalLoadTestConfig)){
            return {valid : false, error : `The value "${givenYaml.regionalLoadTestConfig?.toString()}" for regionalLoadTestConfig is invalid. Provide a valid list of region configuration for Multi-region load test.`};
        }
        
        if(givenYaml.regionalLoadTestConfig.length < 2){
            return {valid : false, error : `Multi-region load tests should contain a minimum of 2 geographic regions in the configuration.`};
        }
        
        var totalEngineCount = 0;
        for(let i = 0; i < givenYaml.regionalLoadTestConfig.length; i++){
            if(isNullOrUndefined(givenYaml.regionalLoadTestConfig[i].region) || typeof givenYaml.regionalLoadTestConfig[i].region != 'string' || givenYaml.regionalLoadTestConfig[i].region == ""){
                return {valid : false, error : `The value "${givenYaml.regionalLoadTestConfig[i].region}" for region in regionalLoadTestConfig is invalid. Provide a valid string.`};
            }
            if(isNullOrUndefined(givenYaml.regionalLoadTestConfig[i].engineInstances) || isNaN(givenYaml.regionalLoadTestConfig[i].engineInstances) || inValidEngineInstances(givenYaml.regionalLoadTestConfig[i].engineInstances)){
                return {valid : false, error : `The value "${givenYaml.regionalLoadTestConfig[i].engineInstances}" for engineInstances in regionalLoadTestConfig is invalid. The value should be an integer between 1 and 400.`};
            }
            totalEngineCount += givenYaml.regionalLoadTestConfig[i].engineInstances;
        }
        let engineInstances = givenYaml.engineInstances ?? 1;
        if(totalEngineCount != givenYaml.engineInstances){
            return {valid : false, error : `The sum of engineInstances in regionalLoadTestConfig should be equal to the value of totalEngineInstances "${engineInstances}" in the test configuration.`};
        }
    }

    return {valid : true, error : ""};
}

function validateFailureCriteria(failureCriteria: any) : ValidationModel {
    if(!Array.isArray(failureCriteria)) {
        if(!isDictionary(failureCriteria)){
            return {valid : false, error : `The value "${failureCriteria?.toString()}" for failureCriteria is invalid. Provide a valid dictionary with keys as ${ValidCriteriaTypes.clientMetrics} and ${ValidCriteriaTypes.serverMetrics}.`};
        }
        let keys = Object.keys(failureCriteria);
        for(let i = 0; i < keys.length; i++){
            let key = keys[i];
            if(!isValidFailureCriteriaType(key)){
                return {valid : false, error : `The value "${key}" for failureCriteria is invalid. Provide a valid dictionary with keys as ${ValidCriteriaTypes.clientMetrics} and ${ValidCriteriaTypes.serverMetrics}.`};
            }
            if(!Array.isArray(failureCriteria[key])){
                return {valid : false, error : `The value "${failureCriteria[key]?.toString()}" for ${key} in failureCriteria is invalid. Provide a valid list of criteria.`};
            }
        }
        if(failureCriteria[ValidCriteriaTypes.serverMetrics]){
            let serverMetrics = failureCriteria[ValidCriteriaTypes.serverMetrics];
            for(let i = 0; i < serverMetrics.length; i++){
                let serverMetric = serverMetrics[i];
                if(!isDictionary(serverMetric)){
                    return {valid : false, error : `The value "${serverMetric?.toString()}" for ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid dictionary with metricName, aggregation, condition, value and optionally metricNamespace.`};
                }
                if(isInvalidString(serverMetric.resourceId)){
                    return {valid : false, error : `The value "${serverMetric.resourceId?.toString()}" for resourceId in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.`};
                }
                if(isInvalidString(serverMetric.metricNameSpace, true)){
                    return {valid : false, error : `The value "${serverMetric.metricNameSpace?.toString()}" for metricNameSpace in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.`};
                }
                if(isInvalidString(serverMetric.metricName)){
                    return {valid : false, error : `The value "${serverMetric.metricName?.toString()}" for metricName in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.`};
                }
                if(isInvalidString(serverMetric.aggregation)){
                    return {valid : false, error : `The value "${serverMetric.aggregation?.toString()}" for aggregation in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.`};
                }
                if(isInvalidString(serverMetric.condition)){
                    return {valid : false, error : `The value "${serverMetric.condition?.toString()}" for condition in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid condition from "${ValidConditionsEnumValuesList.GreaterThan}", "${ValidConditionsEnumValuesList.LessThan}".`};
                }
                if(isNullOrUndefined(serverMetric.value) || typeof serverMetric.value != 'number' || isNaN(serverMetric.value)){
                    return {valid : false, error : `The value "${serverMetric.value?.toString()}" for value in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid number.`};
                }
                if(!isValidConditionEnumString(serverMetric.condition)){
                    return {valid : false, error : `The value "${serverMetric.condition?.toString()}" for condition in ${ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid condition from "${ValidConditionsEnumValuesList.GreaterThan}", "${ValidConditionsEnumValuesList.LessThan}".`};
                }
            }
        }
        if(failureCriteria[ValidCriteriaTypes.clientMetrics]) {
            let clientMetrics = failureCriteria[ValidCriteriaTypes.clientMetrics];
            for(let clientMetric of clientMetrics){
                if(!isDictionary(clientMetric) && typeof clientMetric != 'string'){
                    return {valid : false, error : `The value "${clientMetric?.toString()}" for ${ValidCriteriaTypes.clientMetrics} in failureCriteria is invalid. Provide a valid criteria.`};
                } 
            }
        }
    } else {
        for(let criteria of failureCriteria){
            if(!isDictionary(criteria) && typeof criteria != 'string'){
                return {valid : false, error : `The value "${criteria?.toString()}" for failureCriteria is invalid. Provide a valid criteria.`};
            }
        }
    }
    return {valid : true, error : ""};
}

function validateReferenceIdentities(referenceIdentities: Array<any>) : ValidationModel {
    for(let referenceIdentity of referenceIdentities){        
        if(!isDictionary(referenceIdentity)){
            return {valid : false, error : `The value "${referenceIdentity.toString()}" for referenceIdentities is invalid. Provide a valid dictionary with kind, value and type.`};
        }
        if(referenceIdentity.value != undefined && typeof referenceIdentity.value != 'string'){
            return {valid : false, error : `The value "${referenceIdentity.value.toString()}" for id in referenceIdentities is invalid. Provide a valid string.`};
        }
        if(referenceIdentity.type != undefined && typeof referenceIdentity.type != 'string'){
            return {valid : false, error : `The value "${referenceIdentity.type.toString()}" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
        }
        if(!isValidReferenceIdentityKind(referenceIdentity.kind)){
            return {valid : false, error : `The value "${referenceIdentity.kind}" for kind in referenceIdentity is invalid. Allowed values are 'Metrics', 'Keyvault' and 'Engine'.`};
        }
        if(referenceIdentity.type && !isValidManagedIdentityType(referenceIdentity.type)){
            return {valid : false, error : `The value "${referenceIdentity.type}" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
        }
        if(!isNullOrUndefined(referenceIdentity.value) && referenceIdentity.type == ManagedIdentityType.SystemAssigned){
            return {valid : false, error : `The "reference identity value" should omitted or set to null when using the "SystemAssigned" identity type.`};
        }
        if(isNullOrUndefined(referenceIdentity.value) && referenceIdentity.type == ManagedIdentityType.UserAssigned){
            return {valid : false, error : `The value for 'referenceIdentity value' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'reference identity value'.`};
        }
        if(referenceIdentity.value && isInvalidManagedIdentityId(referenceIdentity.value)){
            return {valid : false, error : `The value "${referenceIdentity.value}" for reference identity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".`};
        }
    }
    return {valid : true, error : ""};
}

function validateAppComponentAndServerMetricsConfig(appComponents: Array<any>) : ValidationModel {
    let appComponentsParsed = appComponents;
    for(let i = 0; i < appComponentsParsed.length; i++){
        if(!isDictionary(appComponentsParsed[i])){
            return {valid : false, error : `The value "${appComponentsParsed[i].toString()}" for AppComponents in the index "${i}" is invalid. Provide a valid dictionary.`};
        }
        let resourceId = appComponentsParsed[i].resourceId;
        if(isInvalidString(resourceId)){
            return {valid : false, error : `The value "${appComponentsParsed[i].resourceId}" for resourceId in appComponents is invalid. Provide a valid resourceId.`};
        }
        resourceId = resourceId.toLowerCase();
        let subscriptionId = getSubscriptionIdFromResourceId(resourceId);
        let resourceType = getResourceTypeFromResourceId(resourceId);
        let name = getResourceNameFromResourceId(resourceId);
        let resourceGroup = getResourceGroupFromResourceId(resourceId);
        if(isNullOrUndefined(resourceGroup) || isNullOrUndefined(subscriptionId) 
            || isNullOrUndefined(resourceType) || isNullOrUndefined(name) 
            || !isValidGUID(subscriptionId)){
            return {valid : false, error : `The value "${resourceId}" for resourceId in appComponents is invalid. Provide a valid resourceId.`};
        }
        if(isInvalidString(appComponentsParsed[i].kind, true)){
            return {valid : false, error : `The value "${appComponentsParsed[i].kind?.toString()}" for kind in appComponents is invalid. Provide a valid string.`};
        }
        if(isInvalidString(appComponentsParsed[i].resourceName, true)){
            return {valid : false, error : `The value "${appComponentsParsed[i].resourceName?.toString()}" for resourceName in appComponents is invalid. Provide a valid string.`};
        }
        let resourceName = appComponentsParsed[i].resourceName || name;
        if(!isNullOrUndefined(appComponentsParsed[i].metrics)) {
            let metrics = appComponentsParsed[i].metrics;
            if(!Array.isArray(metrics)){
                return {valid : false, error : `The value "${metrics?.toString()}" for metrics in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid list of metrics.`};
            }
            for(let metric of metrics){
                if(!isDictionary(metric)){
                    return {valid : false, error : `The value "${metric?.toString()}" for metrics in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid dictionary.`};
                }
                if(metric && isInvalidString(metric.name)){
                    return {valid : false, error : `The value "${metric.name?.toString()}" for name in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.`};
                }
                if(isInvalidString(metric.aggregation)){
                    return {valid : false, error : `The value "${metric.aggregation?.toString()}" for aggregation in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.`};
                }
                if(isInvalidString(metric.namespace, true)){
                    return {valid : false, error : `The value "${metric.namespace?.toString()}" for namespace in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.`};
                }
            }
        } else {
            console.log(`Metrics not provided for the appComponent "${resourceName}", default metrics will be enabled for the same.`);
        }
    }
    return {valid : true, error : ""};
}

function isDictionary(variable: any): variable is { [key: string]: any } {
    return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}

function isValidTestKind(value: string): value is TestKind {
    return Object.values(TestKind).includes(value as TestKind);
}

function isValidConditionEnumString(value: string): value is ManagedIdentityType {
    return Object.values(ValidConditionsEnumValuesList).includes(value as ValidConditionsEnumValuesList);
}

function isValidFailureCriteriaType(value: string): value is ValidCriteriaTypes {
    return Object.values(ValidCriteriaTypes).includes(value as ValidCriteriaTypes);
}

function isInValidSubnet(uri: string): boolean {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.Network\/virtualNetworks\/[a-zA-Z0-9._-]+\/subnets\/[a-zA-Z0-9._-]+$/i;
    return !(pattern.test(uri));
}

function isInvalidManagedIdentityId(uri: string): boolean {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.ManagedIdentity\/userAssignedIdentities\/[a-zA-Z0-9._-]+$/i;

    return !(pattern.test(uri));
}

function isValidReferenceIdentityKind(value: string): value is ManagedIdentityType {
    return Object.values(ReferenceIdentityKinds).includes(value as ReferenceIdentityKinds);
}

function isValidManagedIdentityType(value: string): value is ManagedIdentityType {
    return Object.values(ManagedIdentityType).includes(value as ManagedIdentityType);
}

function isArrayOfStrings(variable: any): variable is string[] {
    return Array.isArray(variable) && variable.every((item) => typeof item === 'string');
}

function isInvalidString(variable: any, allowNull : boolean = false): variable is string[] {
    if(allowNull){
        return !isNullOrUndefined(variable) && (typeof variable != 'string' || variable == "");
    }
    return isNullOrUndefined(variable) || typeof variable != 'string' || variable == "";
}

function isValidGUID(guid: string): boolean {
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(guid);
}