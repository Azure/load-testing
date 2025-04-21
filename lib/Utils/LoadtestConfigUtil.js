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
exports.LoadtestConfigUtil = void 0;
const util_1 = require("util");
const pathLib = require('path');
const Util = __importStar(require("./CommonUtils"));
const EngineUtil = __importStar(require("./EngineUtil"));
const TestKind_1 = require("../models/TestKind");
const yaml = require('js-yaml');
const fs = __importStar(require("fs"));
const PayloadModels_1 = require("../models/PayloadModels");
const UtilModels_1 = require("../models/UtilModels");
const CoreUtils = __importStar(require("./CoreUtils"));
const GeneralConstants_1 = require("../Constants/GeneralConstants");
const InputConstants = __importStar(require("../Constants/InputConstants"));
const PassFailCriteriaUtil_1 = require("./PassFailCriteriaUtil");
const YamlValidationUtil_1 = require("./YamlValidationUtil");
class LoadtestConfigUtil {
    static parseLoadtestConfigFile() {
        var _a, _b, _c, _d, _e, _f, _g;
        const yamlFilePath = this.validateAndGetYamlFilePath();
        const yamlConfig = this.readLoadtestConfigFile(yamlFilePath);
        let loadtestConfig = {};
        let filePath = pathLib.dirname(yamlFilePath);
        loadtestConfig.testId = ((_a = yamlConfig.testId) !== null && _a !== void 0 ? _a : yamlConfig.testName);
        loadtestConfig.testId = loadtestConfig.testId.toLowerCase();
        loadtestConfig.displayName = (_b = yamlConfig.displayName) !== null && _b !== void 0 ? _b : loadtestConfig.testId;
        loadtestConfig.description = yamlConfig.description;
        loadtestConfig.engineInstances = (_c = yamlConfig.engineInstances) !== null && _c !== void 0 ? _c : 1;
        loadtestConfig.kind = (_d = yamlConfig.testType) !== null && _d !== void 0 ? _d : TestKind_1.TestKind.JMX;
        if (yamlConfig.splitAllCSVs != undefined) {
            loadtestConfig.splitAllCSVs = yamlConfig.splitAllCSVs;
        }
        this.parseFileConfiguration(loadtestConfig, yamlConfig, filePath);
        this.parseParameters(loadtestConfig, yamlConfig);
        if (yamlConfig.failureCriteria != undefined) {
            if (Array.isArray(yamlConfig.failureCriteria)) {
                loadtestConfig.failureCriteria = (0, PassFailCriteriaUtil_1.getPassFailCriteriaFromString)(yamlConfig.failureCriteria);
            }
            else {
                loadtestConfig.failureCriteria = (0, PassFailCriteriaUtil_1.getPassFailCriteriaFromString)((_e = yamlConfig.failureCriteria.clientMetrics) !== null && _e !== void 0 ? _e : []);
                loadtestConfig.serverFailureCriteria = (0, PassFailCriteriaUtil_1.getServerCriteriaFromYaml)((_f = yamlConfig.failureCriteria.serverMetrics) !== null && _f !== void 0 ? _f : []);
            }
        }
        if (yamlConfig.autoStop != undefined) {
            loadtestConfig.autoStop = this.getAutoStopCriteria(yamlConfig.autoStop);
        }
        if (yamlConfig.subnetId != undefined) {
            loadtestConfig.subnetId = (yamlConfig.subnetId);
        }
        if (yamlConfig.publicIPDisabled != undefined) {
            loadtestConfig.publicIPDisabled = (yamlConfig.publicIPDisabled);
        }
        // Setting default values for appComponents and serverMetricsConfig
        loadtestConfig.appComponents = {};
        loadtestConfig.serverMetricsConfig = {};
        loadtestConfig.addDefaultsForAppComponents = {};
        if (yamlConfig.appComponents != undefined) {
            this.parseAppComponentsAndServerMetricsConfig(loadtestConfig, yamlConfig.appComponents);
        }
        // Setting default values for reference identities
        loadtestConfig.keyVaultReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        loadtestConfig.metricsReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        loadtestConfig.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.None;
        if (yamlConfig.keyVaultReferenceIdentity != undefined || yamlConfig.keyVaultReferenceIdentityType != undefined) {
            loadtestConfig.keyVaultReferenceIdentityType = yamlConfig.keyVaultReferenceIdentity ? PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned : PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
            loadtestConfig.keyVaultReferenceIdentity = (_g = yamlConfig.keyVaultReferenceIdentity) !== null && _g !== void 0 ? _g : null;
        }
        if (yamlConfig.referenceIdentities != undefined) {
            this.parseReferenceIdentities(loadtestConfig, yamlConfig.referenceIdentities);
        }
        if (yamlConfig.regionalLoadTestConfig != undefined) {
            loadtestConfig.regionalLoadTestConfig = this.getMultiRegionLoadTestConfig(yamlConfig.regionalLoadTestConfig);
        }
        return loadtestConfig;
    }
    static getAutoStopCriteria(autoStopInput) {
        let autoStop;
        if (autoStopInput == null) {
            autoStop = null;
            return autoStop;
        }
        if (typeof autoStopInput == "string") {
            if (autoStopInput == GeneralConstants_1.autoStopDisable) {
                let data = {
                    autoStopDisabled: true,
                };
                autoStop = data;
            }
            else {
                throw new Error("Invalid value, for disabling auto stop use 'autoStop: disable'");
            }
        }
        else {
            let data = {
                autoStopDisabled: false,
                errorRate: autoStopInput.errorPercentage,
                errorRateTimeWindowInSeconds: autoStopInput.timeWindow,
                maximumVirtualUsersPerEngine: autoStopInput.maximumVirtualUsersPerEngine,
            };
            autoStop = data;
        }
        return autoStop;
    }
    static validateAndGetYamlFilePath() {
        var _a;
        let yamlFilePath = (_a = CoreUtils.getInput(InputConstants.loadTestConfigFile)) !== null && _a !== void 0 ? _a : '';
        if ((0, util_1.isNullOrUndefined)(yamlFilePath) || yamlFilePath == '') {
            throw new Error(`The input field "${InputConstants.loadTestConfigFileLabel}" is empty. Provide the path to load test yaml file.`);
        }
        if (!(pathLib.extname(yamlFilePath) === ".yaml" || pathLib.extname(yamlFilePath) === ".yml")) {
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        }
        return yamlFilePath;
    }
    static readLoadtestConfigFile(yamlFilePath) {
        const config = yaml.load(fs.readFileSync(yamlFilePath, 'utf8'));
        let configValidation = (0, YamlValidationUtil_1.validateYamlConfig)(config);
        if (!configValidation.valid) {
            throw new Error(configValidation.error + ` Refer to the load test YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml`);
        }
        return config;
    }
    static parseFileConfiguration(loadtestConfig, yamlConfig, filePath) {
        loadtestConfig.testPlan = pathLib.join(filePath, yamlConfig.testPlan);
        loadtestConfig.configurationFiles = [];
        if (yamlConfig.configurationFiles != undefined) {
            var tempconfigFiles = [];
            tempconfigFiles = yamlConfig.configurationFiles;
            for (let file of tempconfigFiles) {
                if (loadtestConfig.kind == TestKind_1.TestKind.URL && !Util.checkFileType(file, 'csv')) {
                    throw new Error("Only CSV files are allowed as configuration files for a URL-based test.");
                }
                file = pathLib.join(filePath, file);
                loadtestConfig.configurationFiles.push(file);
            }
            ;
        }
        loadtestConfig.zipArtifacts = [];
        if (yamlConfig.zipArtifacts != undefined) {
            var tempconfigFiles = [];
            tempconfigFiles = yamlConfig.zipArtifacts;
            if (loadtestConfig.kind == TestKind_1.TestKind.URL && tempconfigFiles.length > 0) {
                throw new Error("Zip artifacts are not supported for the URL-based test.");
            }
            for (let file of tempconfigFiles) {
                file = pathLib.join(filePath, file);
                loadtestConfig.zipArtifacts.push(file);
            }
            ;
        }
        let framework = EngineUtil.getLoadTestFrameworkModelFromKind(loadtestConfig.kind);
        if (yamlConfig.properties != undefined && yamlConfig.properties.userPropertyFile != undefined) {
            if (loadtestConfig.kind == TestKind_1.TestKind.URL) {
                throw new Error("User property file is not supported for the URL-based test.");
            }
            let propFile = yamlConfig.properties.userPropertyFile;
            loadtestConfig.propertyFile = pathLib.join(filePath, propFile);
            if (!Util.checkFileTypes(yamlConfig.properties.userPropertyFile, framework.userPropertyFileExtensions)) {
                throw new Error(`User property file with extension other than ${framework.ClientResources.userPropertyFileExtensionsFriendly} is not permitted.`);
            }
        }
    }
    static parseParameters(loadtestConfig, yamlConfig) {
        loadtestConfig.secrets = {};
        if (yamlConfig.secrets != undefined) {
            for (let secret of yamlConfig.secrets) {
                let str = `name : ${secret.name}, value : ${secret.value}`;
                if ((0, util_1.isNullOrUndefined)(secret.name)) {
                    throw new Error(`Invalid secret name at ${str}`);
                }
                if (!Util.validateUrl(secret.value)) {
                    throw new Error(`Invalid secret url at ${str}`);
                }
                loadtestConfig.secrets[secret.name] = { type: 'AKV_SECRET_URI', value: secret.value };
            }
        }
        loadtestConfig.environmentVariables = {};
        if (yamlConfig.env != undefined) {
            for (let env of yamlConfig.env) {
                let str = `name : ${env.name}, value : ${env.value}`;
                if ((0, util_1.isNullOrUndefined)(env.name)) {
                    throw new Error(`Invalid environment name at ${str}`);
                }
                loadtestConfig.environmentVariables[env.name] = env.value;
            }
        }
        loadtestConfig.certificates = null;
        if (yamlConfig.certificates != undefined) {
            if (yamlConfig.certificates.length > 1) {
                throw new Error(`Only one certificate can be added in the load test configuration.`);
            }
            if (yamlConfig.certificates.length == 1) {
                let certificate = yamlConfig.certificates[0];
                let str = `name : ${certificate.name}, value : ${certificate.value}`;
                if ((0, util_1.isNullOrUndefined)(certificate.name)) {
                    throw new Error(`Invalid certificate name at ${str}`);
                }
                if (!Util.validateUrlcert(certificate.value)) {
                    throw new Error(`Invalid certificate url at ${str}`);
                }
                loadtestConfig.certificates = { name: certificate.name, type: 'AKV_CERT_URI', value: certificate.value };
            }
        }
    }
    static parseAppComponentsAndServerMetricsConfig(loadtestConfig, appComponents) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        for (let value of appComponents) {
            let resourceId = value.resourceId.toLowerCase();
            loadtestConfig.appComponents[resourceId] = {
                resourceName: (value.resourceName || Util.getResourceNameFromResourceId(resourceId)),
                kind: (_a = value.kind) !== null && _a !== void 0 ? _a : null,
                resourceType: (_b = Util.getResourceTypeFromResourceId(resourceId)) !== null && _b !== void 0 ? _b : '',
                resourceId: resourceId,
                subscriptionId: (_c = Util.getSubscriptionIdFromResourceId(resourceId)) !== null && _c !== void 0 ? _c : '',
                resourceGroup: (_d = Util.getResourceGroupFromResourceId(resourceId)) !== null && _d !== void 0 ? _d : ''
            };
            let metrics = ((_e = value.metrics) !== null && _e !== void 0 ? _e : []);
            if (loadtestConfig.addDefaultsForAppComponents[resourceId] == undefined) {
                loadtestConfig.addDefaultsForAppComponents[resourceId] = metrics.length == 0;
            }
            else {
                // when the same resource has metrics at one place, but not at other, we dont need defaults anymore.
                loadtestConfig.addDefaultsForAppComponents[resourceId] = loadtestConfig.addDefaultsForAppComponents[resourceId] && metrics.length == 0;
            }
            for (let serverComponent of metrics) {
                let key = (resourceId + '/' + ((_f = serverComponent.namespace) !== null && _f !== void 0 ? _f : Util.getResourceTypeFromResourceId(resourceId)) + '/' + serverComponent.name).toLowerCase();
                if (!loadtestConfig.serverMetricsConfig.hasOwnProperty(key) || (0, util_1.isNullOrUndefined)(loadtestConfig.serverMetricsConfig[key])) {
                    loadtestConfig.serverMetricsConfig[key] = {
                        name: serverComponent.name,
                        aggregation: serverComponent.aggregation,
                        metricNamespace: (_g = serverComponent.namespace) !== null && _g !== void 0 ? _g : Util.getResourceTypeFromResourceId(resourceId),
                        resourceId: resourceId,
                        resourceType: (_h = Util.getResourceTypeFromResourceId(resourceId)) !== null && _h !== void 0 ? _h : '',
                        id: key
                    };
                }
                else {
                    loadtestConfig.serverMetricsConfig[key].aggregation = loadtestConfig.serverMetricsConfig[key].aggregation + "," + serverComponent.aggregation;
                }
            }
        }
    }
    static parseReferenceIdentities(loadtestConfig, referenceIdentities) {
        let segregatedManagedIdentities = Util.validateAndGetSegregatedManagedIdentities(referenceIdentities);
        loadtestConfig.keyVaultReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault].length > 0 ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault][0] : null;
        loadtestConfig.keyVaultReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault].length > 0 ? PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned : PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        loadtestConfig.metricsReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Metrics].length > 0 ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Metrics][0] : null;
        loadtestConfig.metricsReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Metrics].length > 0 ? PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned : PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        if (segregatedManagedIdentities.referenceIdentiesSystemAssignedCount[UtilModels_1.ReferenceIdentityKinds.Engine] > 0) {
            loadtestConfig.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        }
        else if (segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Engine].length > 0) {
            loadtestConfig.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned;
            loadtestConfig.engineReferenceIdentities = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Engine];
        }
        else {
            loadtestConfig.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.None;
        }
    }
    static getMultiRegionLoadTestConfig(multiRegionalConfig) {
        let parsedMultiRegionConfiguration = [];
        multiRegionalConfig.forEach(regionConfig => {
            let data = {
                region: regionConfig.region,
                engineInstances: regionConfig.engineInstances,
            };
            parsedMultiRegionConfiguration.push(data);
        });
        return parsedMultiRegionConfiguration;
    }
}
exports.LoadtestConfigUtil = LoadtestConfigUtil;
