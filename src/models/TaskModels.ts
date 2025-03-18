import { isNullOrUndefined } from "util";
const pathLib = require('path');
import * as Util from './util';
import * as EngineUtil from './engine/Util';
import { TestKind } from "./engine/TestKind";
import { BaseLoadTestFrameworkModel } from "./engine/BaseLoadTestFrameworkModel";
const yaml = require('js-yaml');
import * as fs from 'fs';
import { AppComponentDefinition, AutoStopCriteria, AutoStopCriteria as autoStopCriteriaObjOut, ManagedIdentityTypeForAPI, PassFailServerMetric, ResourceMetricModel, ServerMetricConfig, TestRunModel } from "./PayloadModels";
import {  AllManagedIdentitiesSegregated, AutoStopCriteriaObjYaml, ParamType, ReferenceIdentityKinds, RunTimeParams, ServerMetricsClientModel, ValidationModel, ValidConditionsEnumValuesList } from "./UtilModels";
import { PassFailMetric, CertificateMetadata, SecretMetadata, RegionConfiguration } from "./PayloadModels";
import { autoStopDisable, OutputVariableName } from "./constants";
import * as InputConstants from "./InputConstants";
import * as CoreUtils from './CoreUtils';

export class YamlConfig {
    testId:string = '';
    displayName:string = '';
    description:string = '';
    testPlan: string = '';
    kind?: TestKind = TestKind.JMX;
    engineInstances: number = 1;
    subnetId?: string;
    publicIPDisabled: boolean = false;
    configurationFiles: string[] = [];
    zipArtifacts: string[] = [];
    splitAllCSVs: boolean = false;
    propertyFile: string| null = null;
    env: { [key: string]: string | null } = {};
    certificates: CertificateMetadata| null = null;
    secrets: { [key: string] : SecretMetadata | null} = {};

    failureCriteria: { [key: string]: number } = {}; // this is yaml model.
    serverFailureCriteria: PassFailServerMetric[]  = []; // this is yaml model.

    passFailApiModel : { [key: string]: PassFailMetric | null } = {}; // this is api model.
    passFailServerModel : { [key: string]: PassFailServerMetric | null } = {}; // this is api model.

    keyVaultReferenceIdentityType: ManagedIdentityTypeForAPI = ManagedIdentityTypeForAPI.SystemAssigned;
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI = ManagedIdentityTypeForAPI.SystemAssigned;
    engineReferenceIdentityType: ManagedIdentityTypeForAPI = ManagedIdentityTypeForAPI.None;

    keyVaultReferenceIdentity: string| null = null;
    metricsReferenceIdentity: string| null = null;
    engineReferenceIdentities: string[] | null = null;

    autoStop: autoStopCriteriaObjOut | null = null;

    regionalLoadTestConfig: RegionConfiguration[] | null = null;
    runTimeParams: RunTimeParams = {env: {}, secrets: {}, runDisplayName: '', runDescription: '', testId: '', testRunId: ''};

    appComponents: { [key: string] : AppComponentDefinition | null } = {};
    serverMetricsConfig: { [key: string] :  ResourceMetricModel | null } = {};

    addDefaultsForAppComponents: { [key: string]: boolean } = {}; // when server components are not given for few app components, we need to add the defaults for this.
    outputVariableName: string = OutputVariableName;

    constructor(isPostProcess: boolean = false) {
        if(isPostProcess) {
            return;
        }
        let yamlFile = CoreUtils.getInput(InputConstants.loadTestConfigFile) ?? '';
        if(isNullOrUndefined(yamlFile) || yamlFile == ''){
            throw new Error(`The input field "${InputConstants.loadTestConfigFileLabel}" is empty. Provide the path to load test yaml file.`);
        }

        let yamlPath = yamlFile;
        if(!(pathLib.extname(yamlPath) === ".yaml" || pathLib.extname(yamlPath) === ".yml"))
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        const config: any = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
        let validConfig : ValidationModel = Util.checkValidityYaml(config);
        if(!validConfig.valid){
            throw new Error(validConfig.error + ` Refer to the load test YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml`);
        }
        this.testId = config.testId ?? config.testName;
        this.testId = this.testId.toLowerCase();
        this.displayName = config.displayName ?? this.testId;
        this.description = config.description;
        this.engineInstances = config.engineInstances ?? 1;
        let path = pathLib.dirname(yamlPath);
        this.testPlan = pathLib.join(path,config.testPlan);
    
        this.kind = config.testType as TestKind ?? TestKind.JMX;
        let framework : BaseLoadTestFrameworkModel = EngineUtil.getLoadTestFrameworkModelFromKind(this.kind);
    
        if(config.configurationFiles != undefined) {
            var tempconfigFiles: string[]=[];
            tempconfigFiles = config.configurationFiles;
            for(let file of tempconfigFiles){
                if(this.kind == TestKind.URL && !Util.checkFileType(file,'csv')){
                    throw new Error("Only CSV files are allowed as configuration files for a URL-based test.");
                }
                file = pathLib.join(path,file);
                this.configurationFiles.push(file);
            };
        }
        if(config.zipArtifacts != undefined){
            var tempconfigFiles: string[]=[];
            tempconfigFiles = config.zipArtifacts;
            if(this.kind == TestKind.URL && tempconfigFiles.length > 0){
                throw new Error("Zip artifacts are not supported for the URL-based test.");
            }
            for(let file of tempconfigFiles){
                file = pathLib.join(path,file);
                this.zipArtifacts.push(file);
            };
        }
        if(config.splitAllCSVs !=undefined){
            this.splitAllCSVs = config.splitAllCSVs;
        }
        if(config.failureCriteria != undefined) {
            if(Array.isArray(config.failureCriteria)) {
                this.failureCriteria = Util.getPassFailCriteriaFromString(config.failureCriteria);
            } else {
                this.failureCriteria = Util.getPassFailCriteriaFromString(config.failureCriteria.clientMetrics ?? []);
                this.serverFailureCriteria = Util.getServerCriteriaFromYaml(config.failureCriteria.serverMetrics ?? []);
            }
        }
        if (config.autoStop != undefined) {
            this.autoStop = this.getAutoStopCriteria(config.autoStop);
        }
        if(config.subnetId != undefined) {
            this.subnetId = (config.subnetId);
        }
        if(config.publicIPDisabled != undefined) {
            this.publicIPDisabled = (config.publicIPDisabled)
        }
        if(config.properties != undefined && config.properties.userPropertyFile != undefined)
        {
            if(this.kind == TestKind.URL){
                throw new Error("User property file is not supported for the URL-based test.");
            }
            let propFile = config.properties.userPropertyFile;
            this.propertyFile = pathLib.join(path,propFile);
            if(!Util.checkFileTypes(config.properties.userPropertyFile, framework.userPropertyFileExtensions)){
                throw new Error(`User property file with extension other than ${framework.ClientResources.userPropertyFileExtensionsFriendly} is not permitted.`);
            }
        }
        if(config.secrets != undefined) {
            this.secrets = this.parseParameters(config.secrets, ParamType.secrets) as { [key: string]: SecretMetadata };
        }
        if(config.env != undefined) {
            this.env = this.parseParameters(config.env, ParamType.env) as { [key: string]: string };
        }
        if(config.certificates != undefined){
            this.certificates = this.parseParameters(config.certificates, ParamType.cert) as CertificateMetadata | null;
        }

        if(config.appComponents != undefined) {
            let appcomponents = config.appComponents as Array<any>;
            this.getAppComponentsAndServerMetricsConfig(appcomponents);
        }

        if(config.keyVaultReferenceIdentity != undefined || config.keyVaultReferenceIdentityType != undefined) {
            this.keyVaultReferenceIdentityType = config.keyVaultReferenceIdentity ? ManagedIdentityTypeForAPI.UserAssigned : ManagedIdentityTypeForAPI.SystemAssigned;
            this.keyVaultReferenceIdentity = config.keyVaultReferenceIdentity ?? null;
        }

        if(config.referenceIdentities != undefined) {
            this.getReferenceIdentities(config.referenceIdentities as {[key: string]: string}[]);
        }

        if(config.regionalLoadTestConfig != undefined) {
            this.regionalLoadTestConfig = this.getMultiRegionLoadTestConfig(config.regionalLoadTestConfig);
        }

        if(this.testId === '' || isNullOrUndefined(this.testId) || this.testPlan === '' || isNullOrUndefined(this.testPlan)) {
            throw new Error("The required fields testId/testPlan are missing in "+yamlPath+".");
        }
    }

    getAppComponentsAndServerMetricsConfig(appComponents: Array<any>) {
        for(let value of appComponents) {
            let resourceId = value.resourceId.toLowerCase();
            this.appComponents[resourceId] = {
                resourceName: (value.resourceName || Util.getResourceNameFromResourceId(resourceId)),
                kind: value.kind ?? null,
                resourceType: Util.getResourceTypeFromResourceId(resourceId) ?? '',
                resourceId: resourceId,
                subscriptionId: Util.getSubscriptionIdFromResourceId(resourceId) ?? '',
                resourceGroup: Util.getResourceGroupFromResourceId(resourceId) ?? ''
            };
            let metrics = (value.metrics ?? []) as Array<ServerMetricsClientModel>;
            
            if(this.addDefaultsForAppComponents[resourceId] == undefined) {
                this.addDefaultsForAppComponents[resourceId] = metrics.length == 0;
            } else {
                this.addDefaultsForAppComponents[resourceId] = this.addDefaultsForAppComponents[resourceId] && metrics.length == 0; 
                // when the same resource has metrics at one place, but not at other, we dont need defaults anymore.
            }

            for(let serverComponent of metrics) {
                let key : string = (resourceId + '/' + (serverComponent.namespace ?? Util.getResourceTypeFromResourceId(resourceId)) + '/' + serverComponent.name).toLowerCase();
                if(!this.serverMetricsConfig.hasOwnProperty(key) || isNullOrUndefined(this.serverMetricsConfig[key])) {
                    this.serverMetricsConfig[key] = {
                        name: serverComponent.name,
                        aggregation: serverComponent.aggregation,
                        metricNamespace: serverComponent.namespace ?? Util.getResourceTypeFromResourceId(resourceId),
                        resourceId: resourceId,
                        resourceType: Util.getResourceTypeFromResourceId(resourceId) ?? '',
                        id: key
                    }
                } else {
                    this.serverMetricsConfig[key]!.aggregation = this.serverMetricsConfig[key]!.aggregation + "," + serverComponent.aggregation;
                }
            }
        }
    }

    getReferenceIdentities(referenceIdentities: {[key: string]: string}[]) {

        let segregatedManagedIdentities : AllManagedIdentitiesSegregated = Util.validateAndGetSegregatedManagedIdentities(referenceIdentities);
        
        this.keyVaultReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault].length > 0  ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault][0] : null;
        this.keyVaultReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault].length > 0 ? ManagedIdentityTypeForAPI.UserAssigned : ManagedIdentityTypeForAPI.SystemAssigned;

        this.metricsReferenceIdentity = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Metrics].length > 0  ? segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Metrics][0] : null;
        this.metricsReferenceIdentityType = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Metrics].length > 0 ? ManagedIdentityTypeForAPI.UserAssigned : ManagedIdentityTypeForAPI.SystemAssigned;
        
        if(segregatedManagedIdentities.referenceIdentiesSystemAssignedCount[ReferenceIdentityKinds.Engine] > 0) {
            this.engineReferenceIdentityType = ManagedIdentityTypeForAPI.SystemAssigned;
        } else if(segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Engine].length > 0) {
            this.engineReferenceIdentityType = ManagedIdentityTypeForAPI.UserAssigned;
            this.engineReferenceIdentities = segregatedManagedIdentities.referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Engine];
        } else {
            this.engineReferenceIdentityType = ManagedIdentityTypeForAPI.None;
        }
    }

    getAutoStopCriteria(autoStopInput : AutoStopCriteriaObjYaml | string | null): AutoStopCriteria | null {
        let autoStop: AutoStopCriteria | null;
        if (autoStopInput == null) {autoStop = null; return autoStop;}
        if (typeof autoStopInput == "string") {
            if (autoStopInput == autoStopDisable) {
                let data = {
                    autoStopDisabled : true,
                    errorRate: 90,
                    errorRateTimeWindowInSeconds: 60,
                };
                autoStop = data;
            } else {
                throw new Error(
                    "Invalid value, for disabling auto stop use 'autoStop: disable'"
                );
            }
        } else {
            let data = {
                autoStopDisabled : false,
                errorRate: autoStopInput.errorPercentage,
                errorRateTimeWindowInSeconds: autoStopInput.timeWindow,
            };
            autoStop = data;
        }
        return autoStop;
    }

    parseParameters(obj:{name: string, value: string}[], type:ParamType) : {[key: string]: SecretMetadata | string}| CertificateMetadata | null{
        if(type == ParamType.secrets) {
            let secretsParsed : {[key: string] : SecretMetadata} = {};
            for (var index in obj) {
                var val = obj[index];
                let str : string =  `name : ${val.name}, value : ${val.value}`;
                if(isNullOrUndefined(val.name)){
                    throw new Error(`Invalid secret name at ${str}`);
                }
                if(!Util.validateUrl(val.value)){
                    throw new Error(`Invalid secret url at ${str}`);
                }
                secretsParsed[val.name] = {type: 'AKV_SECRET_URI',value: val.value};
            }
            return secretsParsed;
        }
    
        if(type == ParamType.env) {
            let envParsed : {[key: string] : string} = {};
            for(var index in obj) {
                let val = obj[index];
                let str : string =  `name : ${val.name}, value : ${val.value}`;
                if(isNullOrUndefined(val.name)){
                    throw new Error(`Invalid environment name at ${str}`);
                }
                val = obj[index];
                envParsed[val.name] = val.value;
            }
            return envParsed;
        }
    
        if(type == ParamType.cert){
            let cert : CertificateMetadata| null = null;
            if(obj.length > 1){
                throw new Error(`Only one certificate can be added in the load test configuration.`);
            }
            if(obj.length == 1) {
                let val = obj[0];
                let str : string =  `name : ${val.name}, value : ${val.value}`;
                if(isNullOrUndefined(val.name)){
                    throw new Error(`Invalid certificate name at ${str}`);
                }
                if(!Util.validateUrlcert(val.value))
                    throw new Error(`Invalid certificate url at ${str}`);
                cert = {name: val.name ,type: 'AKV_CERT_URI',value: val.value};
            }
            return cert;
        }
        return null;
    }

    getMultiRegionLoadTestConfig(multiRegionalConfig : any[]) : RegionConfiguration[] {
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