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
exports.validateYamlConfig = void 0;
const util_1 = require("util");
const UtilModels_1 = require("../models/UtilModels");
const CommonUtils_1 = require("./CommonUtils");
const EngineUtil = __importStar(require("./EngineUtil"));
const TestKind_1 = require("../models/TestKind");
const YamlConfig_1 = require("../models/YamlConfig");
function validateYamlConfig(givenYaml) {
    var _a, _b, _c;
    if (!isDictionary(givenYaml)) {
        return { valid: false, error: `Invalid YAML syntax.` };
    }
    let unSupportedKeys = [];
    let supportedKeys = Object.keys(new YamlConfig_1.YamlConfig());
    unSupportedKeys = Object.keys(givenYaml).filter(element => supportedKeys.indexOf(element) == -1);
    if (unSupportedKeys.length) {
        const result = unSupportedKeys.map(element => `${element}`).join(", ");
        return { valid: false, error: `The YAML file provided has unsupported field(s) "${result}".` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.testName) && (0, util_1.isNullOrUndefined)(givenYaml.testId)) {
        return { valid: false, error: "The required field testId is missing in the load test YAML file." };
    }
    let testId = '';
    if (!(0, util_1.isNullOrUndefined)(givenYaml.testName)) {
        testId = givenYaml.testName;
    }
    if (!(0, util_1.isNullOrUndefined)(givenYaml.testId)) {
        testId = givenYaml.testId;
    }
    testId = testId.toLowerCase();
    if (typeof (testId) != "string" || (0, CommonUtils_1.invalidName)(testId)) {
        return { valid: false, error: `The value "${testId}" for testId is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.` };
    }
    if (givenYaml.displayName && (typeof givenYaml.displayName != 'string' || (0, CommonUtils_1.invalidDisplayName)(givenYaml.displayName))) {
        return { valid: false, error: `The value "${givenYaml.displayName}" for displayName is invalid. Display name must be a string of length between 2 to 50.` };
    }
    if (givenYaml.description && (typeof givenYaml.description != 'string' || (0, CommonUtils_1.invalidDescription)(givenYaml.description))) {
        return { valid: false, error: `The value "${givenYaml.description}" for description is invalid. Description must be a string of length less than 100.` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.testPlan)) {
        return { valid: false, error: "The required field testPlan is missing in the load test YAML file." };
    }
    if (givenYaml.engineInstances && (isNaN(givenYaml.engineInstances) || (0, CommonUtils_1.inValidEngineInstances)(givenYaml.engineInstances))) {
        return { valid: false, error: `The value "${givenYaml.engineInstances}" for engineInstances is invalid. The value should be an integer between 1 and 400.` };
    }
    let kind = (_a = givenYaml.testType) !== null && _a !== void 0 ? _a : TestKind_1.TestKind.JMX;
    if (!isValidTestKind(kind)) {
        return { valid: false, error: `The value "${kind}" for testType is invalid. Acceptable values are ${EngineUtil.Resources.Strings.allFrameworksFriendly}.` };
    }
    let framework = EngineUtil.getLoadTestFrameworkModelFromKind(kind);
    if (givenYaml.testType == TestKind_1.TestKind.URL) {
        if (!(0, CommonUtils_1.checkFileType)(givenYaml.testPlan, 'json')) {
            return { valid: false, error: "The testPlan for a URL test should of type \"json\"." };
        }
    }
    else if (!(0, CommonUtils_1.checkFileType)(givenYaml.testPlan, framework.testScriptFileExtension)) {
        return { valid: false, error: `The testPlan for a ${kind} test should of type "${framework.testScriptFileExtension}".` };
    }
    if (givenYaml.subnetId && (typeof givenYaml.subnetId != 'string' || isInValidSubnet(givenYaml.subnetId))) {
        return { valid: false, error: `The value "${givenYaml.subnetId}" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".` };
    }
    if (givenYaml.keyVaultReferenceIdentity && (typeof givenYaml.keyVaultReferenceIdentity != 'string' || isInvalidManagedIdentityId(givenYaml.keyVaultReferenceIdentity))) {
        return { valid: false, error: `The value "${givenYaml.keyVaultReferenceIdentity}" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".` };
    }
    if (givenYaml.keyVaultReferenceIdentityType != undefined && givenYaml.keyVaultReferenceIdentityType != null && !isValidManagedIdentityType(givenYaml.keyVaultReferenceIdentityType)) {
        return { valid: false, error: `The value "${givenYaml.keyVaultReferenceIdentityType}" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".` };
    }
    if (!(0, util_1.isNullOrUndefined)(givenYaml.referenceIdentities)) {
        if (!Array.isArray(givenYaml.referenceIdentities)) {
            return { valid: false, error: `The value "${givenYaml.referenceIdentities.toString()}" for referenceIdentities is invalid. Provide a valid list of reference identities.` };
        }
        let result = validateReferenceIdentities(givenYaml.referenceIdentities);
        if ((result === null || result === void 0 ? void 0 : result.valid) == false) {
            return result;
        }
        try {
            if (givenYaml.keyVaultReferenceIdentityType || givenYaml.keyVaultReferenceIdentity) {
                (0, CommonUtils_1.validateAndGetSegregatedManagedIdentities)(givenYaml.referenceIdentities, true);
            }
            else {
                (0, CommonUtils_1.validateAndGetSegregatedManagedIdentities)(givenYaml.referenceIdentities);
            }
        }
        catch (error) {
            return { valid: false, error: error.message };
        }
    }
    if (!(0, util_1.isNullOrUndefined)(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == UtilModels_1.ManagedIdentityType.SystemAssigned) {
        return { valid: false, error: `The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.` };
    }
    if ((0, util_1.isNullOrUndefined)(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == UtilModels_1.ManagedIdentityType.UserAssigned) {
        return { valid: false, error: `"The value for 'keyVaultReferenceIdentity' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'keyVaultReferenceIdentity'."` };
    }
    if (givenYaml.publicIPDisabled && typeof givenYaml.publicIPDisabled != 'boolean') {
        return { valid: false, error: `The value "${givenYaml.publicIPDisabled}" for publicIPDisabled is invalid. The value should be either true or false.` };
    }
    if (givenYaml.publicIPDisabled && (0, util_1.isNullOrUndefined)(givenYaml.subnetId)) {
        return { valid: false, error: `Public IP deployment can only be disabled for tests against private endpoints. For public endpoints, set publicIPDisabled to False.` };
    }
    if (givenYaml.configurationFiles && !isArrayOfStrings(givenYaml.configurationFiles)) {
        return { valid: false, error: `The value "${givenYaml.configurationFiles}" for configurationFiles is invalid. Provide a valid list of strings.` };
    }
    if (givenYaml.zipArtifacts && !isArrayOfStrings(givenYaml.zipArtifacts)) {
        return { valid: false, error: `The value "${givenYaml.zipArtifacts}" for zipArtifacts is invalid. Provide a valid list of strings.` };
    }
    if (givenYaml.splitAllCSVs && typeof givenYaml.splitAllCSVs != 'boolean') {
        return { valid: false, error: `The value "${givenYaml.splitAllCSVs}" for splitAllCSVs is invalid. The value should be either true or false` };
    }
    if (givenYaml.properties != undefined && givenYaml.properties.userPropertyFile != undefined) {
        if ((0, util_1.isNull)(givenYaml.properties.userPropertyFile) || typeof givenYaml.properties.userPropertyFile != 'string' || !(0, CommonUtils_1.checkFileTypes)(givenYaml.properties.userPropertyFile, framework.userPropertyFileExtensions)) {
            return { valid: false, error: `The value "${givenYaml.properties.userPropertyFile}" for userPropertyFile is invalid. Provide a valid file path of type ${framework.ClientResources.userPropertyFileExtensionsFriendly}. Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.` };
        }
    }
    if (givenYaml.appComponents) {
        if (!Array.isArray(givenYaml.appComponents)) {
            return { valid: false, error: `The value "${givenYaml.appComponents}" for appComponents is invalid. Provide a valid list of application components.` };
        }
        let validationAppComponents = validateAppComponentAndServerMetricsConfig(givenYaml.appComponents);
        if (validationAppComponents.valid == false) {
            return validationAppComponents;
        }
    }
    if (givenYaml.autoStop) {
        let validation = (0, CommonUtils_1.validateAutoStop)(givenYaml.autoStop);
        if (validation.valid == false) {
            return validation;
        }
    }
    if (givenYaml.failureCriteria != undefined) {
        let result = validateFailureCriteria(givenYaml.failureCriteria);
        if (result.valid == false) {
            return result;
        }
    }
    if (givenYaml.regionalLoadTestConfig) {
        if (!Array.isArray(givenYaml.regionalLoadTestConfig)) {
            return { valid: false, error: `The value "${(_b = givenYaml.regionalLoadTestConfig) === null || _b === void 0 ? void 0 : _b.toString()}" for regionalLoadTestConfig is invalid. Provide a valid list of region configuration for Multi-region load test.` };
        }
        if (givenYaml.regionalLoadTestConfig.length < 2) {
            return { valid: false, error: `Multi-region load tests should contain a minimum of 2 geographic regions in the configuration.` };
        }
        var totalEngineCount = 0;
        for (let i = 0; i < givenYaml.regionalLoadTestConfig.length; i++) {
            if ((0, util_1.isNullOrUndefined)(givenYaml.regionalLoadTestConfig[i].region) || typeof givenYaml.regionalLoadTestConfig[i].region != 'string' || givenYaml.regionalLoadTestConfig[i].region == "") {
                return { valid: false, error: `The value "${givenYaml.regionalLoadTestConfig[i].region}" for region in regionalLoadTestConfig is invalid. Provide a valid string.` };
            }
            if ((0, util_1.isNullOrUndefined)(givenYaml.regionalLoadTestConfig[i].engineInstances) || isNaN(givenYaml.regionalLoadTestConfig[i].engineInstances) || (0, CommonUtils_1.inValidEngineInstances)(givenYaml.regionalLoadTestConfig[i].engineInstances)) {
                return { valid: false, error: `The value "${givenYaml.regionalLoadTestConfig[i].engineInstances}" for engineInstances in regionalLoadTestConfig is invalid. The value should be an integer between 1 and 400.` };
            }
            totalEngineCount += givenYaml.regionalLoadTestConfig[i].engineInstances;
        }
        let engineInstances = (_c = givenYaml.engineInstances) !== null && _c !== void 0 ? _c : 1;
        if (totalEngineCount != givenYaml.engineInstances) {
            return { valid: false, error: `The sum of engineInstances in regionalLoadTestConfig should be equal to the value of totalEngineInstances "${engineInstances}" in the test configuration.` };
        }
    }
    return { valid: true, error: "" };
}
exports.validateYamlConfig = validateYamlConfig;
function validateFailureCriteria(failureCriteria) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (!Array.isArray(failureCriteria)) {
        if (!isDictionary(failureCriteria)) {
            return { valid: false, error: `The value "${failureCriteria === null || failureCriteria === void 0 ? void 0 : failureCriteria.toString()}" for failureCriteria is invalid. Provide a valid dictionary with keys as ${UtilModels_1.ValidCriteriaTypes.clientMetrics} and ${UtilModels_1.ValidCriteriaTypes.serverMetrics}.` };
        }
        let keys = Object.keys(failureCriteria);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (!isValidFailureCriteriaType(key)) {
                return { valid: false, error: `The value "${key}" for failureCriteria is invalid. Provide a valid dictionary with keys as ${UtilModels_1.ValidCriteriaTypes.clientMetrics} and ${UtilModels_1.ValidCriteriaTypes.serverMetrics}.` };
            }
            if (!Array.isArray(failureCriteria[key])) {
                return { valid: false, error: `The value "${(_a = failureCriteria[key]) === null || _a === void 0 ? void 0 : _a.toString()}" for ${key} in failureCriteria is invalid. Provide a valid list of criteria.` };
            }
        }
        if (failureCriteria[UtilModels_1.ValidCriteriaTypes.serverMetrics]) {
            let serverMetrics = failureCriteria[UtilModels_1.ValidCriteriaTypes.serverMetrics];
            for (let i = 0; i < serverMetrics.length; i++) {
                let serverMetric = serverMetrics[i];
                if (!isDictionary(serverMetric)) {
                    return { valid: false, error: `The value "${serverMetric === null || serverMetric === void 0 ? void 0 : serverMetric.toString()}" for ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid dictionary with metricName, aggregation, condition, value and optionally metricNamespace.` };
                }
                if (isInvalidString(serverMetric.resourceId)) {
                    return { valid: false, error: `The value "${(_b = serverMetric.resourceId) === null || _b === void 0 ? void 0 : _b.toString()}" for resourceId in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.` };
                }
                if (isInvalidString(serverMetric.metricNameSpace, true)) {
                    return { valid: false, error: `The value "${(_c = serverMetric.metricNameSpace) === null || _c === void 0 ? void 0 : _c.toString()}" for metricNameSpace in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.` };
                }
                if (isInvalidString(serverMetric.metricName)) {
                    return { valid: false, error: `The value "${(_d = serverMetric.metricName) === null || _d === void 0 ? void 0 : _d.toString()}" for metricName in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.` };
                }
                if (isInvalidString(serverMetric.aggregation)) {
                    return { valid: false, error: `The value "${(_e = serverMetric.aggregation) === null || _e === void 0 ? void 0 : _e.toString()}" for aggregation in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid string.` };
                }
                if (isInvalidString(serverMetric.condition)) {
                    return { valid: false, error: `The value "${(_f = serverMetric.condition) === null || _f === void 0 ? void 0 : _f.toString()}" for condition in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid condition from "${UtilModels_1.ValidConditionsEnumValuesList.GreaterThan}", "${UtilModels_1.ValidConditionsEnumValuesList.LessThan}".` };
                }
                if ((0, util_1.isNullOrUndefined)(serverMetric.value) || typeof serverMetric.value != 'number' || isNaN(serverMetric.value)) {
                    return { valid: false, error: `The value "${(_g = serverMetric.value) === null || _g === void 0 ? void 0 : _g.toString()}" for value in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid number.` };
                }
                if (!isValidConditionEnumString(serverMetric.condition)) {
                    return { valid: false, error: `The value "${(_h = serverMetric.condition) === null || _h === void 0 ? void 0 : _h.toString()}" for condition in ${UtilModels_1.ValidCriteriaTypes.serverMetrics} in failureCriteria is invalid. Provide a valid condition from "${UtilModels_1.ValidConditionsEnumValuesList.GreaterThan}", "${UtilModels_1.ValidConditionsEnumValuesList.LessThan}".` };
                }
            }
        }
        if (failureCriteria[UtilModels_1.ValidCriteriaTypes.clientMetrics]) {
            let clientMetrics = failureCriteria[UtilModels_1.ValidCriteriaTypes.clientMetrics];
            for (let clientMetric of clientMetrics) {
                if (!isDictionary(clientMetric) && typeof clientMetric != 'string') {
                    return { valid: false, error: `The value "${clientMetric === null || clientMetric === void 0 ? void 0 : clientMetric.toString()}" for ${UtilModels_1.ValidCriteriaTypes.clientMetrics} in failureCriteria is invalid. Provide a valid criteria.` };
                }
            }
        }
    }
    else {
        for (let criteria of failureCriteria) {
            if (!isDictionary(criteria) && typeof criteria != 'string') {
                return { valid: false, error: `The value "${criteria === null || criteria === void 0 ? void 0 : criteria.toString()}" for failureCriteria is invalid. Provide a valid criteria.` };
            }
        }
    }
    return { valid: true, error: "" };
}
function validateReferenceIdentities(referenceIdentities) {
    for (let referenceIdentity of referenceIdentities) {
        if (!isDictionary(referenceIdentity)) {
            return { valid: false, error: `The value "${referenceIdentity.toString()}" for referenceIdentities is invalid. Provide a valid dictionary with kind, value and type.` };
        }
        if (referenceIdentity.value != undefined && typeof referenceIdentity.value != 'string') {
            return { valid: false, error: `The value "${referenceIdentity.value.toString()}" for id in referenceIdentities is invalid. Provide a valid string.` };
        }
        if (referenceIdentity.type != undefined && typeof referenceIdentity.type != 'string') {
            return { valid: false, error: `The value "${referenceIdentity.type.toString()}" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".` };
        }
        if (!isValidReferenceIdentityKind(referenceIdentity.kind)) {
            return { valid: false, error: `The value "${referenceIdentity.kind}" for kind in referenceIdentity is invalid. Allowed values are 'Metrics', 'Keyvault' and 'Engine'.` };
        }
        if (referenceIdentity.type && !isValidManagedIdentityType(referenceIdentity.type)) {
            return { valid: false, error: `The value "${referenceIdentity.type}" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".` };
        }
        if (!(0, util_1.isNullOrUndefined)(referenceIdentity.value) && referenceIdentity.type == UtilModels_1.ManagedIdentityType.SystemAssigned) {
            return { valid: false, error: `The "reference identity value" should omitted or set to null when using the "SystemAssigned" identity type.` };
        }
        if ((0, util_1.isNullOrUndefined)(referenceIdentity.value) && referenceIdentity.type == UtilModels_1.ManagedIdentityType.UserAssigned) {
            return { valid: false, error: `The value for 'referenceIdentity value' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'reference identity value'.` };
        }
        if (referenceIdentity.value && isInvalidManagedIdentityId(referenceIdentity.value)) {
            return { valid: false, error: `The value "${referenceIdentity.value}" for reference identity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".` };
        }
    }
    return { valid: true, error: "" };
}
function validateAppComponentAndServerMetricsConfig(appComponents) {
    var _a, _b, _c, _d, _e;
    let appComponentsParsed = appComponents;
    for (let i = 0; i < appComponentsParsed.length; i++) {
        if (!isDictionary(appComponentsParsed[i])) {
            return { valid: false, error: `The value "${appComponentsParsed[i].toString()}" for AppComponents in the index "${i}" is invalid. Provide a valid dictionary.` };
        }
        let resourceId = appComponentsParsed[i].resourceId;
        if (isInvalidString(resourceId)) {
            return { valid: false, error: `The value "${appComponentsParsed[i].resourceId}" for resourceId in appComponents is invalid. Provide a valid resourceId.` };
        }
        resourceId = resourceId.toLowerCase();
        let subscriptionId = (0, CommonUtils_1.getSubscriptionIdFromResourceId)(resourceId);
        let resourceType = (0, CommonUtils_1.getResourceTypeFromResourceId)(resourceId);
        let name = (0, CommonUtils_1.getResourceNameFromResourceId)(resourceId);
        let resourceGroup = (0, CommonUtils_1.getResourceGroupFromResourceId)(resourceId);
        if ((0, util_1.isNullOrUndefined)(resourceGroup) || (0, util_1.isNullOrUndefined)(subscriptionId)
            || (0, util_1.isNullOrUndefined)(resourceType) || (0, util_1.isNullOrUndefined)(name)
            || !isValidGUID(subscriptionId)) {
            return { valid: false, error: `The value "${resourceId}" for resourceId in appComponents is invalid. Provide a valid resourceId.` };
        }
        if (isInvalidString(appComponentsParsed[i].kind, true)) {
            return { valid: false, error: `The value "${(_a = appComponentsParsed[i].kind) === null || _a === void 0 ? void 0 : _a.toString()}" for kind in appComponents is invalid. Provide a valid string.` };
        }
        if (isInvalidString(appComponentsParsed[i].resourceName, true)) {
            return { valid: false, error: `The value "${(_b = appComponentsParsed[i].resourceName) === null || _b === void 0 ? void 0 : _b.toString()}" for resourceName in appComponents is invalid. Provide a valid string.` };
        }
        let resourceName = appComponentsParsed[i].resourceName || name;
        if (!(0, util_1.isNullOrUndefined)(appComponentsParsed[i].metrics)) {
            let metrics = appComponentsParsed[i].metrics;
            if (!Array.isArray(metrics)) {
                return { valid: false, error: `The value "${metrics === null || metrics === void 0 ? void 0 : metrics.toString()}" for metrics in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid list of metrics.` };
            }
            for (let metric of metrics) {
                if (!isDictionary(metric)) {
                    return { valid: false, error: `The value "${metric === null || metric === void 0 ? void 0 : metric.toString()}" for metrics in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid dictionary.` };
                }
                if (metric && isInvalidString(metric.name)) {
                    return { valid: false, error: `The value "${(_c = metric.name) === null || _c === void 0 ? void 0 : _c.toString()}" for name in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.` };
                }
                if (isInvalidString(metric.aggregation)) {
                    return { valid: false, error: `The value "${(_d = metric.aggregation) === null || _d === void 0 ? void 0 : _d.toString()}" for aggregation in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.` };
                }
                if (isInvalidString(metric.namespace, true)) {
                    return { valid: false, error: `The value "${(_e = metric.namespace) === null || _e === void 0 ? void 0 : _e.toString()}" for namespace in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.` };
                }
            }
        }
        else {
            console.log(`Metrics not provided for the appComponent "${resourceName}", default metrics will be enabled for the same.`);
        }
    }
    return { valid: true, error: "" };
}
function isDictionary(variable) {
    return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}
function isValidTestKind(value) {
    return Object.values(TestKind_1.TestKind).includes(value);
}
function isValidConditionEnumString(value) {
    return Object.values(UtilModels_1.ValidConditionsEnumValuesList).includes(value);
}
function isValidFailureCriteriaType(value) {
    return Object.values(UtilModels_1.ValidCriteriaTypes).includes(value);
}
function isInValidSubnet(uri) {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.Network\/virtualNetworks\/[a-zA-Z0-9._-]+\/subnets\/[a-zA-Z0-9._-]+$/i;
    return !(pattern.test(uri));
}
function isInvalidManagedIdentityId(uri) {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.ManagedIdentity\/userAssignedIdentities\/[a-zA-Z0-9._-]+$/i;
    return !(pattern.test(uri));
}
function isValidReferenceIdentityKind(value) {
    return Object.values(UtilModels_1.ReferenceIdentityKinds).includes(value);
}
function isValidManagedIdentityType(value) {
    return Object.values(UtilModels_1.ManagedIdentityType).includes(value);
}
function isArrayOfStrings(variable) {
    return Array.isArray(variable) && variable.every((item) => typeof item === 'string');
}
function isInvalidString(variable, allowNull = false) {
    if (allowNull) {
        return !(0, util_1.isNullOrUndefined)(variable) && (typeof variable != 'string' || variable == "");
    }
    return (0, util_1.isNullOrUndefined)(variable) || typeof variable != 'string' || variable == "";
}
function isValidGUID(guid) {
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(guid);
}
