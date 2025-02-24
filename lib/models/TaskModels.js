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
exports.YamlConfig = void 0;
const util_1 = require("util");
const pathLib = require('path');
const Util = __importStar(require("./util"));
const EngineUtil = __importStar(require("./engine/Util"));
const TestKind_1 = require("./engine/TestKind");
const yaml = require('js-yaml');
const fs = __importStar(require("fs"));
const PayloadModels_1 = require("./PayloadModels");
const UtilModels_1 = require("./UtilModels");
const constants_1 = require("./constants");
const InputConstants = __importStar(require("./InputConstants"));
const CoreUtils = __importStar(require("./CoreUtils"));
class YamlConfig {
    constructor(isPostProcess = false) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        this.testId = '';
        this.displayName = '';
        this.description = '';
        this.testPlan = '';
        this.kind = TestKind_1.TestKind.JMX;
        this.engineInstances = 1;
        this.publicIPDisabled = false;
        this.configurationFiles = [];
        this.zipArtifacts = [];
        this.splitAllCSVs = false;
        this.propertyFile = null;
        this.env = {};
        this.certificates = null;
        this.secrets = {};
        this.failureCriteria = {}; // this is yaml model.
        this.serverFailureCriteria = []; // this is yaml model.
        this.passFailApiModel = {}; // this is api model.
        this.passFailServerModel = {}; // this is api model.
        this.keyVaultReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        this.metricsReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        this.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.None;
        this.keyVaultReferenceIdentity = null;
        this.metricsReferenceIdentity = null;
        this.engineReferenceIdentities = null;
        this.autoStop = null;
        this.regionalLoadTestConfig = null;
        this.runTimeParams = { env: {}, secrets: {}, runDisplayName: '', runDescription: '', testId: '', testRunId: '' };
        this.appComponents = {};
        this.serverMetricsConfig = {};
        this.addDefaultsForAppComponents = {}; // when server components are not given for few app components, we need to add the defaults for this.
        this.outputVariableName = constants_1.OutputVariableName;
        if (isPostProcess) {
            return;
        }
        let yamlFile = (_a = CoreUtils.getInput(InputConstants.loadTestConfigFile)) !== null && _a !== void 0 ? _a : '';
        if ((0, util_1.isNullOrUndefined)(yamlFile) || yamlFile == '') {
            throw new Error(`The input field "${InputConstants.loadTestConfigFileLabel}" is empty. Provide the path to load test yaml file.`);
        }
        let yamlPath = yamlFile;
        if (!(pathLib.extname(yamlPath) === ".yaml" || pathLib.extname(yamlPath) === ".yml"))
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        const config = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
        let validConfig = Util.checkValidityYaml(config);
        if (!validConfig.valid) {
            throw new Error(validConfig.error + ` Refer to the load test YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml`);
        }
        this.testId = (_b = config.testId) !== null && _b !== void 0 ? _b : config.testName;
        this.testId = this.testId.toLowerCase();
        this.displayName = (_c = config.displayName) !== null && _c !== void 0 ? _c : this.testId;
        this.description = config.description;
        this.engineInstances = (_d = config.engineInstances) !== null && _d !== void 0 ? _d : 1;
        let path = pathLib.dirname(yamlPath);
        this.testPlan = pathLib.join(path, config.testPlan);
        this.kind = (_e = config.testType) !== null && _e !== void 0 ? _e : TestKind_1.TestKind.JMX;
        let framework = EngineUtil.getLoadTestFrameworkModelFromKind(this.kind);
        if (config.configurationFiles != undefined) {
            var tempconfigFiles = [];
            tempconfigFiles = config.configurationFiles;
            for (let file of tempconfigFiles) {
                if (this.kind == TestKind_1.TestKind.URL && !Util.checkFileType(file, 'csv')) {
                    throw new Error("Only CSV files are allowed as configuration files for a URL-based test.");
                }
                file = pathLib.join(path, file);
                this.configurationFiles.push(file);
            }
            ;
        }
        if (config.zipArtifacts != undefined) {
            var tempconfigFiles = [];
            tempconfigFiles = config.zipArtifacts;
            if (this.kind == TestKind_1.TestKind.URL && tempconfigFiles.length > 0) {
                throw new Error("Zip artifacts are not supported for the URL-based test.");
            }
            for (let file of tempconfigFiles) {
                file = pathLib.join(path, file);
                this.zipArtifacts.push(file);
            }
            ;
        }
        if (config.splitAllCSVs != undefined) {
            this.splitAllCSVs = config.splitAllCSVs;
        }
        if (config.failureCriteria != undefined) {
            if (Array.isArray(config.failureCriteria)) {
                this.failureCriteria = Util.getPassFailCriteriaFromString(config.failureCriteria);
            }
            else {
                this.failureCriteria = Util.getPassFailCriteriaFromString((_f = config.failureCriteria.clientMetrics) !== null && _f !== void 0 ? _f : []);
                this.serverFailureCriteria = Util.getServerCriteriaFromYaml((_g = config.failureCriteria.serverMetrics) !== null && _g !== void 0 ? _g : []);
            }
        }
        if (config.autoStop != undefined) {
            this.autoStop = this.getAutoStopCriteria(config.autoStop);
        }
        if (config.subnetId != undefined) {
            this.subnetId = (config.subnetId);
        }
        if (config.publicIPDisabled != undefined) {
            this.publicIPDisabled = (config.publicIPDisabled);
        }
        if (config.properties != undefined && config.properties.userPropertyFile != undefined) {
            if (this.kind == TestKind_1.TestKind.URL) {
                throw new Error("User property file is not supported for the URL-based test.");
            }
            let propFile = config.properties.userPropertyFile;
            this.propertyFile = pathLib.join(path, propFile);
            if (!Util.checkFileTypes(config.properties.userPropertyFile, framework.userPropertyFileExtensions)) {
                throw new Error(`User property file with extension other than ${framework.ClientResources.userPropertyFileExtensionsFriendly} is not permitted.`);
            }
        }
        if (config.secrets != undefined) {
            this.secrets = this.parseParameters(config.secrets, UtilModels_1.ParamType.secrets);
        }
        if (config.env != undefined) {
            this.env = this.parseParameters(config.env, UtilModels_1.ParamType.env);
        }
        if (config.certificates != undefined) {
            this.certificates = this.parseParameters(config.certificates, UtilModels_1.ParamType.cert);
        }
        if (config.appComponents != undefined) {
            let appcomponents = config.appComponents;
            this.getAppComponentsAndServerMetricsConfig(appcomponents);
        }
        if (config.keyVaultReferenceIdentity != undefined || config.keyVaultReferenceIdentityType != undefined) {
            this.keyVaultReferenceIdentityType = config.keyVaultReferenceIdentity ? PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned : PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
            this.keyVaultReferenceIdentity = (_h = config.keyVaultReferenceIdentity) !== null && _h !== void 0 ? _h : null;
        }
        if (config.referenceIdentities != undefined) {
            this.getReferenceIdentities(config.referenceIdentities);
        }
        if (config.regionalLoadTestConfig != undefined) {
            this.regionalLoadTestConfig = this.getMultiRegionLoadTestConfig(config.regionalLoadTestConfig);
        }
        if (this.testId === '' || (0, util_1.isNullOrUndefined)(this.testId) || this.testPlan === '' || (0, util_1.isNullOrUndefined)(this.testPlan)) {
            throw new Error("The required fields testId/testPlan are missing in " + yamlPath + ".");
        }
    }
    getAppComponentsAndServerMetricsConfig(appComponents) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        for (let value of appComponents) {
            let resourceId = value.resourceId.toLowerCase();
            this.appComponents[resourceId] = {
                resourceName: (value.resourceName || Util.getResourceNameFromResourceId(resourceId)),
                kind: (_a = value.kind) !== null && _a !== void 0 ? _a : null,
                resourceType: (_b = Util.getResourceTypeFromResourceId(resourceId)) !== null && _b !== void 0 ? _b : '',
                resourceId: resourceId,
                subscriptionId: (_c = Util.getSubscriptionIdFromResourceId(resourceId)) !== null && _c !== void 0 ? _c : '',
                resourceGroup: (_d = Util.getResourceGroupFromResourceId(resourceId)) !== null && _d !== void 0 ? _d : ''
            };
            let metrics = ((_e = value.metrics) !== null && _e !== void 0 ? _e : []);
            if (this.addDefaultsForAppComponents[resourceId] == undefined) {
                this.addDefaultsForAppComponents[resourceId] = metrics.length == 0;
            }
            else {
                this.addDefaultsForAppComponents[resourceId] = this.addDefaultsForAppComponents[resourceId] && metrics.length == 0;
                // when the same resource has metrics at one place, but not at other, we dont need defaults anymore.
            }
            for (let serverComponent of metrics) {
                let key = resourceId.toLowerCase() + '/' + ((_f = serverComponent.namespace) !== null && _f !== void 0 ? _f : Util.getResourceTypeFromResourceId(resourceId)) + '/' + serverComponent.name;
                if (!this.serverMetricsConfig.hasOwnProperty(key) || (0, util_1.isNullOrUndefined)(this.serverMetricsConfig[key])) {
                    this.serverMetricsConfig[key] = {
                        name: serverComponent.name,
                        aggregation: serverComponent.aggregation,
                        metricNamespace: (_g = serverComponent.namespace) !== null && _g !== void 0 ? _g : Util.getResourceTypeFromResourceId(resourceId),
                        resourceId: resourceId,
                        resourceType: (_h = Util.getResourceTypeFromResourceId(resourceId)) !== null && _h !== void 0 ? _h : '',
                        id: key
                    };
                }
                else {
                    this.serverMetricsConfig[key].aggregation = this.serverMetricsConfig[key].aggregation + "," + serverComponent.aggregation;
                }
            }
        }
    }
    getReferenceIdentities(referenceIdentities) {
        let segregatedManagedIdentities = Util.validateAndGetSegregatedManagedIdentities(referenceIdentities);
        this.keyVaultReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault].length > 0 ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault][0] : null;
        this.keyVaultReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.KeyVault].length > 0 ? PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned : PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        this.metricsReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Metrics].length > 0 ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Metrics][0] : null;
        this.metricsReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Metrics].length > 0 ? PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned : PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        if (segregatedManagedIdentities.referenceIdentiesSystemAssignedCount[UtilModels_1.ReferenceIdentityKinds.Engine] > 0) {
            this.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.SystemAssigned;
        }
        else if (segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Engine].length > 0) {
            this.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.UserAssigned;
            this.engineReferenceIdentities = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[UtilModels_1.ReferenceIdentityKinds.Engine];
        }
        else {
            this.engineReferenceIdentityType = PayloadModels_1.ManagedIdentityTypeForAPI.None;
        }
    }
    getAutoStopCriteria(autoStopInput) {
        let autoStop;
        if (autoStopInput == null) {
            autoStop = null;
            return autoStop;
        }
        if (typeof autoStopInput == "string") {
            if (autoStopInput == constants_1.autoStopDisable) {
                let data = {
                    autoStopDisabled: true,
                    errorRate: 90,
                    errorRateTimeWindowInSeconds: 60,
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
            };
            autoStop = data;
        }
        return autoStop;
    }
    parseParameters(obj, type) {
        if (type == UtilModels_1.ParamType.secrets) {
            let secretsParsed = {};
            for (var index in obj) {
                var val = obj[index];
                let str = `name : ${val.name}, value : ${val.value}`;
                if ((0, util_1.isNullOrUndefined)(val.name)) {
                    throw new Error(`Invalid secret name at ${str}`);
                }
                if (!Util.validateUrl(val.value)) {
                    throw new Error(`Invalid secret url at ${str}`);
                }
                secretsParsed[val.name] = { type: 'AKV_SECRET_URI', value: val.value };
            }
            return secretsParsed;
        }
        if (type == UtilModels_1.ParamType.env) {
            let envParsed = {};
            for (var index in obj) {
                let val = obj[index];
                let str = `name : ${val.name}, value : ${val.value}`;
                if ((0, util_1.isNullOrUndefined)(val.name)) {
                    throw new Error(`Invalid environment name at ${str}`);
                }
                val = obj[index];
                envParsed[val.name] = val.value;
            }
            return envParsed;
        }
        if (type == UtilModels_1.ParamType.cert) {
            let cert = null;
            if (obj.length > 1) {
                throw new Error(`Only one certificate can be added in the load test configuration.`);
            }
            if (obj.length == 1) {
                let val = obj[0];
                let str = `name : ${val.name}, value : ${val.value}`;
                if ((0, util_1.isNullOrUndefined)(val.name)) {
                    throw new Error(`Invalid certificate name at ${str}`);
                }
                if (!Util.validateUrlcert(val.value))
                    throw new Error(`Invalid certificate url at ${str}`);
                cert = { name: val.name, type: 'AKV_CERT_URI', value: val.value };
            }
            return cert;
        }
        return null;
    }
    getMultiRegionLoadTestConfig(multiRegionalConfig) {
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
exports.YamlConfig = YamlConfig;
