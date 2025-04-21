import { isNullOrUndefined } from "util";
const pathLib = require('path');
import * as Util from './CommonUtils';
import * as EngineUtil from './EngineUtil';
import { TestKind } from "../models/TestKind";
import { BaseLoadTestFrameworkModel } from "../models/engine/BaseLoadTestFrameworkModel";
const yaml = require('js-yaml');
import * as fs from 'fs';
import { AutoStopCriteria, ManagedIdentityTypeForAPI } from "../models/PayloadModels";
import {  AllManagedIdentitiesSegregated, AutoStopCriteriaObjYaml, ReferenceIdentityKinds, ServerMetricsClientModel, ValidationModel } from "../models/UtilModels";
import * as CoreUtils from './CoreUtils';
import { RegionConfiguration } from "../models/PayloadModels";
import { autoStopDisable } from "../Constants/GeneralConstants";
import * as InputConstants from "../Constants/InputConstants";
import { LoadtestConfig } from "../models/LoadtestConfig";
import { getPassFailCriteriaFromString, getServerCriteriaFromYaml } from "./PassFailCriteriaUtil";
import { validateYamlConfig } from "./YamlValidationUtil";
import { YamlConfig } from "../models/YamlConfig";

export class LoadtestConfigUtil {
    
    public static parseLoadtestConfigFile(): LoadtestConfig {
        const yamlFilePath = this.validateAndGetYamlFilePath();
        const yamlConfig: YamlConfig = this.readLoadtestConfigFile(yamlFilePath);

        let loadtestConfig = {} as LoadtestConfig;
        let filePath = pathLib.dirname(yamlFilePath);

        loadtestConfig.testId = (yamlConfig.testId ?? yamlConfig.testName)!;

        loadtestConfig.testId = loadtestConfig.testId.toLowerCase();
        loadtestConfig.displayName = yamlConfig.displayName ?? loadtestConfig.testId;
        loadtestConfig.description = yamlConfig.description;
        loadtestConfig.engineInstances = yamlConfig.engineInstances ?? 1;
        loadtestConfig.kind = yamlConfig.testType as TestKind ?? TestKind.JMX;
    
        if(yamlConfig.splitAllCSVs != undefined){
            loadtestConfig.splitAllCSVs = yamlConfig.splitAllCSVs;
        }

        this.parseFileConfiguration(loadtestConfig, yamlConfig, filePath);
        this.parseParameters(loadtestConfig, yamlConfig);

        if(yamlConfig.failureCriteria != undefined) {
            if(Array.isArray(yamlConfig.failureCriteria)) {
                loadtestConfig.failureCriteria = getPassFailCriteriaFromString(yamlConfig.failureCriteria);
            } 
            else {
                loadtestConfig.failureCriteria = getPassFailCriteriaFromString(yamlConfig.failureCriteria.clientMetrics ?? []);
                loadtestConfig.serverFailureCriteria = getServerCriteriaFromYaml(yamlConfig.failureCriteria.serverMetrics ?? []);
            }
        }

        if (yamlConfig.autoStop != undefined) {
            loadtestConfig.autoStop = this.getAutoStopCriteria(yamlConfig.autoStop);
        }

        if(yamlConfig.subnetId != undefined) {
            loadtestConfig.subnetId = (yamlConfig.subnetId);
        }

        if(yamlConfig.publicIPDisabled != undefined) {
            loadtestConfig.publicIPDisabled = (yamlConfig.publicIPDisabled)
        }

        // Setting default values for appComponents and serverMetricsConfig
        loadtestConfig.appComponents = {};
        loadtestConfig.serverMetricsConfig = {};
        loadtestConfig.addDefaultsForAppComponents = {};

        if(yamlConfig.appComponents != undefined) {
            this.parseAppComponentsAndServerMetricsConfig(loadtestConfig, yamlConfig.appComponents);
        }

        // Setting default values for reference identities
        loadtestConfig.keyVaultReferenceIdentityType = ManagedIdentityTypeForAPI.SystemAssigned;
        loadtestConfig.metricsReferenceIdentityType = ManagedIdentityTypeForAPI.SystemAssigned;
        loadtestConfig.engineReferenceIdentityType = ManagedIdentityTypeForAPI.None;

        if(yamlConfig.keyVaultReferenceIdentity != undefined || yamlConfig.keyVaultReferenceIdentityType != undefined) {
            loadtestConfig.keyVaultReferenceIdentityType = yamlConfig.keyVaultReferenceIdentity ? ManagedIdentityTypeForAPI.UserAssigned : ManagedIdentityTypeForAPI.SystemAssigned;
            loadtestConfig.keyVaultReferenceIdentity = yamlConfig.keyVaultReferenceIdentity ?? null;
        }

        if(yamlConfig.referenceIdentities != undefined) {
            this.parseReferenceIdentities(loadtestConfig, yamlConfig.referenceIdentities as {[key: string]: string}[]);
        }

        if(yamlConfig.regionalLoadTestConfig != undefined) {
            loadtestConfig.regionalLoadTestConfig = this.getMultiRegionLoadTestConfig(yamlConfig.regionalLoadTestConfig);
        }

        return loadtestConfig;
    }

    public static getAutoStopCriteria(autoStopInput : AutoStopCriteriaObjYaml | string | null): AutoStopCriteria | null {
        let autoStop: AutoStopCriteria | null;
        if (autoStopInput == null) {
            autoStop = null; 
            return autoStop;
        }
        
        if (typeof autoStopInput == "string") {
            if (autoStopInput == autoStopDisable) {
                let data = {
                    autoStopDisabled : true,
                };
                autoStop = data;
            } 
            else {
                throw new Error(
                    "Invalid value, for disabling auto stop use 'autoStop: disable'"
                );
            }
        } 
        else {
            let data = {
                autoStopDisabled : false,
                errorRate: autoStopInput.errorPercentage,
                errorRateTimeWindowInSeconds: autoStopInput.timeWindow,
                maximumVirtualUsersPerEngine: autoStopInput.maximumVirtualUsersPerEngine,
            };
            autoStop = data;
        }

        return autoStop;
    }

    private static validateAndGetYamlFilePath(): string {
        let yamlFilePath = CoreUtils.getInput(InputConstants.loadTestConfigFile) ?? '';
        if(isNullOrUndefined(yamlFilePath) || yamlFilePath == ''){
            throw new Error(`The input field "${InputConstants.loadTestConfigFileLabel}" is empty. Provide the path to load test yaml file.`);
        }

        if(!(pathLib.extname(yamlFilePath) === ".yaml" || pathLib.extname(yamlFilePath) === ".yml")) {
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        }

        return yamlFilePath;
    }

    private static readLoadtestConfigFile(yamlFilePath: string): YamlConfig {
        const config: any = yaml.load(fs.readFileSync(yamlFilePath, 'utf8'));

        let configValidation : ValidationModel = validateYamlConfig(config);
        if(!configValidation.valid){
            throw new Error(configValidation.error + ` Refer to the load test YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml`);
        }

        return config as YamlConfig;
    }

    private static parseFileConfiguration(loadtestConfig: LoadtestConfig, yamlConfig: YamlConfig, filePath: string) {
        loadtestConfig.testPlan = pathLib.join(filePath, yamlConfig.testPlan);

        loadtestConfig.configurationFiles = [];

        if(yamlConfig.configurationFiles != undefined) {
            var tempconfigFiles: string[] = [];
            tempconfigFiles = yamlConfig.configurationFiles;

            for(let file of tempconfigFiles){
                if(loadtestConfig.kind == TestKind.URL && !Util.checkFileType(file, 'csv')){
                    throw new Error("Only CSV files are allowed as configuration files for a URL-based test.");
                }

                file = pathLib.join(filePath, file);
                loadtestConfig.configurationFiles.push(file);
            };
        }
        
        loadtestConfig.zipArtifacts = [];

        if(yamlConfig.zipArtifacts != undefined){
            var tempconfigFiles: string[] = [];
            tempconfigFiles = yamlConfig.zipArtifacts;

            if(loadtestConfig.kind == TestKind.URL && tempconfigFiles.length > 0){
                throw new Error("Zip artifacts are not supported for the URL-based test.");
            }

            for(let file of tempconfigFiles){
                file = pathLib.join(filePath, file);
                loadtestConfig.zipArtifacts.push(file);
            };
        }

        let framework : BaseLoadTestFrameworkModel = EngineUtil.getLoadTestFrameworkModelFromKind(loadtestConfig.kind);

        if(yamlConfig.properties != undefined && yamlConfig.properties.userPropertyFile != undefined)
        {
            if(loadtestConfig.kind == TestKind.URL){
                throw new Error("User property file is not supported for the URL-based test.");
            }
            let propFile = yamlConfig.properties.userPropertyFile;
            loadtestConfig.propertyFile = pathLib.join(filePath, propFile);

            if(!Util.checkFileTypes(yamlConfig.properties.userPropertyFile, framework.userPropertyFileExtensions)){
                throw new Error(`User property file with extension other than ${framework.ClientResources.userPropertyFileExtensionsFriendly} is not permitted.`);
            }
        }
    }

    private static parseParameters(loadtestConfig: LoadtestConfig, yamlConfig: YamlConfig) {
        loadtestConfig.secrets = {};

        if (yamlConfig.secrets != undefined) {
            for (let secret of yamlConfig.secrets) {
                let str : string =  `name : ${secret.name}, value : ${secret.value}`;
    
                if(isNullOrUndefined(secret.name)){
                    throw new Error(`Invalid secret name at ${str}`);
                }
    
                if(!Util.validateUrl(secret.value)){
                    throw new Error(`Invalid secret url at ${str}`);
                }
                loadtestConfig.secrets[secret.name] = { type: 'AKV_SECRET_URI', value: secret.value };
            }
        }
    
        loadtestConfig.environmentVariables = {};

        if (yamlConfig.env != undefined) {
            for(let env of yamlConfig.env) {
                let str : string =  `name : ${env.name}, value : ${env.value}`;
    
                if(isNullOrUndefined(env.name)){
                    throw new Error(`Invalid environment name at ${str}`);
                }
                loadtestConfig.environmentVariables[env.name] = env.value;
            }
        }
    
        loadtestConfig.certificates = null;

        if (yamlConfig.certificates != undefined) {
            if(yamlConfig.certificates.length > 1){
                throw new Error(`Only one certificate can be added in the load test configuration.`);
            }
    
            if(yamlConfig.certificates.length == 1) {
                let certificate = yamlConfig.certificates[0];
                let str : string =  `name : ${certificate.name}, value : ${certificate.value}`;
    
                if(isNullOrUndefined(certificate.name)){
                    throw new Error(`Invalid certificate name at ${str}`);
                }
    
                if(!Util.validateUrlcert(certificate.value)){
                    throw new Error(`Invalid certificate url at ${str}`);
                }
                loadtestConfig.certificates = { name: certificate.name, type: 'AKV_CERT_URI', value: certificate.value };
            }
        }
    }

    private static parseAppComponentsAndServerMetricsConfig(loadtestConfig: LoadtestConfig, appComponents: Array<any>) {
        for(let value of appComponents) {
            let resourceId = value.resourceId.toLowerCase();

            loadtestConfig.appComponents[resourceId] = {
                resourceName: (value.resourceName || Util.getResourceNameFromResourceId(resourceId)),
                kind: value.kind ?? null,
                resourceType: Util.getResourceTypeFromResourceId(resourceId) ?? '',
                resourceId: resourceId,
                subscriptionId: Util.getSubscriptionIdFromResourceId(resourceId) ?? '',
                resourceGroup: Util.getResourceGroupFromResourceId(resourceId) ?? ''
            };

            let metrics = (value.metrics ?? []) as Array<ServerMetricsClientModel>;
            
            if(loadtestConfig.addDefaultsForAppComponents[resourceId] == undefined) {
                loadtestConfig.addDefaultsForAppComponents[resourceId] = metrics.length == 0;
            }
            else {
                // when the same resource has metrics at one place, but not at other, we dont need defaults anymore.
                loadtestConfig.addDefaultsForAppComponents[resourceId] = loadtestConfig.addDefaultsForAppComponents[resourceId] && metrics.length == 0; 
            }

            for(let serverComponent of metrics) {
                let key : string = (resourceId + '/' + (serverComponent.namespace ?? Util.getResourceTypeFromResourceId(resourceId)) + '/' + serverComponent.name).toLowerCase();

                if(!loadtestConfig.serverMetricsConfig.hasOwnProperty(key) || isNullOrUndefined(loadtestConfig.serverMetricsConfig[key])) {
                    loadtestConfig.serverMetricsConfig[key] = {
                        name: serverComponent.name,
                        aggregation: serverComponent.aggregation,
                        metricNamespace: serverComponent.namespace ?? Util.getResourceTypeFromResourceId(resourceId),
                        resourceId: resourceId,
                        resourceType: Util.getResourceTypeFromResourceId(resourceId) ?? '',
                        id: key
                    }
                }
                else {
                    loadtestConfig.serverMetricsConfig[key]!.aggregation = loadtestConfig.serverMetricsConfig[key]!.aggregation + "," + serverComponent.aggregation;
                }
            }
        }
    }

    private static parseReferenceIdentities(loadtestConfig: LoadtestConfig, referenceIdentities: {[key: string]: string}[]) {

        let segregatedManagedIdentities : AllManagedIdentitiesSegregated = Util.validateAndGetSegregatedManagedIdentities(referenceIdentities);
        
        loadtestConfig.keyVaultReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault].length > 0  ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault][0] : null;
        loadtestConfig.keyVaultReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault].length > 0 ? ManagedIdentityTypeForAPI.UserAssigned : ManagedIdentityTypeForAPI.SystemAssigned;

        loadtestConfig.metricsReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Metrics].length > 0  ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Metrics][0] : null;
        loadtestConfig.metricsReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Metrics].length > 0 ? ManagedIdentityTypeForAPI.UserAssigned : ManagedIdentityTypeForAPI.SystemAssigned;
        
        if(segregatedManagedIdentities.referenceIdentiesSystemAssignedCount[ReferenceIdentityKinds.Engine] > 0) {
            loadtestConfig.engineReferenceIdentityType = ManagedIdentityTypeForAPI.SystemAssigned;
        } 
        else if(segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Engine].length > 0) {
            loadtestConfig.engineReferenceIdentityType = ManagedIdentityTypeForAPI.UserAssigned;
            loadtestConfig.engineReferenceIdentities = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Engine];
        } 
        else {
            loadtestConfig.engineReferenceIdentityType = ManagedIdentityTypeForAPI.None;
        }
    }

    private static getMultiRegionLoadTestConfig(multiRegionalConfig : Array<{region: string, engineInstances: number}>) : RegionConfiguration[] {
        let parsedMultiRegionConfiguration : RegionConfiguration[] = []
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