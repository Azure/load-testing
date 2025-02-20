import { isNullOrUndefined } from "util";
const pathLib = require('path');
import * as Util from './util';
import * as EngineUtil from './engine/Util';
import { TestKind } from "./engine/TestKind";
import { BaseLoadTestFrameworkModel } from "./engine/BaseLoadTestFrameworkModel";
const yaml = require('js-yaml');
import * as fs from 'fs';
import { AutoStopCriteria, AutoStopCriteria as autoStopCriteriaObjOut } from "./PayloadModels";
import {  AutoStopCriteriaObjYaml, ManagedIdentityType,  ParamType, RunTimeParams } from "./UtilModels";
import * as core from '@actions/core';
import { PassFailMetric, ExistingParams, TestModel, CertificateMetadata, SecretMetadata, RegionConfiguration } from "./PayloadModels";

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
    passFailApiModel : { [key: string]: PassFailMetric | null } = {}; // this is api model.
    autoStop: autoStopCriteriaObjOut | null = null;
    keyVaultReferenceIdentity: string| null = null;
    keyVaultReferenceIdentityType: ManagedIdentityType = ManagedIdentityType.SystemAssigned;
    regionalLoadTestConfig: RegionConfiguration[] | null = null;
    runTimeParams: RunTimeParams = {env: {}, secrets: {}, runDisplayName: '', runDescription: '', testId: '', testRunId: ''};

    constructor() {
        let yamlFile = core.getInput('loadTestConfigFile') ?? '';
        if(isNullOrUndefined(yamlFile) || yamlFile == ''){
            throw new Error(`The input field "loadTestConfigFile" is empty. Provide the path to load test yaml file.`);
        }

        let yamlPath = yamlFile;
        if(!(pathLib.extname(yamlPath) === ".yaml" || pathLib.extname(yamlPath) === ".yml"))
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        const config: any = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
        let validConfig : {valid : boolean, error :string} = Util.checkValidityYaml(config);
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
            this.failureCriteria = Util.getPassFailCriteriaFromString(config.failureCriteria);
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
            this.keyVaultReferenceIdentityType = ManagedIdentityType.SystemAssigned;
            this.secrets = this.parseParameters(config.secrets, ParamType.secrets) as { [key: string]: SecretMetadata };
        }
        if(config.env != undefined) {
            this.env = this.parseParameters(config.env, ParamType.env) as { [key: string]: string };
        }
        if(config.certificates != undefined){
            this.certificates = this.parseParameters(config.certificates, ParamType.cert) as CertificateMetadata | null;
        }
        if(config.keyVaultReferenceIdentity != undefined) {
            this.keyVaultReferenceIdentityType = ManagedIdentityType.UserAssigned;
            this.keyVaultReferenceIdentity = config.keyVaultReferenceIdentity;
        }
        if(config.regionalLoadTestConfig != undefined) {
            this.regionalLoadTestConfig = this.getMultiRegionLoadTestConfig(config.regionalLoadTestConfig);
        }
        // commenting out for now, will re-write this logic with the changed options.
        // if(config.engineBuiltInIdentityType != undefined) {
        //     engineBuiltInIdentityType = config.engineBuiltInIdentityType;
        // }
        // if(config.engineBuiltInIdentityIds != undefined) {
        //     engineBuiltInIdentityIds = config.engineBuiltInIdentityIds;
        // }
        if(this.testId === '' || isNullOrUndefined(this.testId) || this.testPlan === '' || isNullOrUndefined(this.testPlan)) {
            throw new Error("The required fields testId/testPlan are missing in "+yamlPath+".");
        }
        this.runTimeParams =  this.getRunTimeParams();
        Util.validateTestRunParamsFromPipeline(this.runTimeParams);
    }

    getRunTimeParams() {
        var secretRun = core.getInput('secrets');
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
                throw new Error("Invalid format of secrets in the pipeline yaml file. Refer to the pipeline YAML syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-test-secured-endpoints?tabs=pipelines#reference-the-secret-in-the-load-test-configuration");
            }
        }
        var eRun = core.getInput('env');
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
                throw new Error("Invalid format of env in the pipeline yaml file. Refer to the pipeline YAML syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-test-secured-endpoints?tabs=pipelines#reference-the-secret-in-the-load-test-configuration"); 
            }
        }
        const runDisplayName = core.getInput('loadTestRunName') ?? Util.getDefaultTestRunName();
        const runDescription = core.getInput('loadTestRunDescription') ?? Util.getDefaultRunDescription();

        let runTimeParams : RunTimeParams = {env: envParsed, secrets: secretsParsed, runDisplayName, runDescription, testId: '', testRunId: ''};
        return runTimeParams;
    }

    getFileName(filepath:string) {
        var filename = pathLib.basename(filepath);
        return filename;
    }
    
    mergeExistingData(existingData:ExistingParams) {
        let existingCriteria = existingData.passFailCriteria;
        let existingCriteriaIds = Object.keys(existingCriteria);
        var numberOfExistingCriteria = existingCriteriaIds.length;
        var index = 0;

        for(var key in this.failureCriteria) {
            var splitted = key.split(" ");
            var criteriaId = index < numberOfExistingCriteria ? existingCriteriaIds[index++] : Util.getUniqueId();
            this.passFailApiModel[criteriaId] = {
                clientMetric: splitted[0],
                aggregate: splitted[1],
                condition: splitted[2],
                action : splitted[3],
                value: this.failureCriteria[key],
                requestName: splitted.length > 4 ? splitted.slice(4).join(' ') : null 
            };
        }

        for (; index < numberOfExistingCriteria; index++) {
            this.passFailApiModel[existingCriteriaIds[index]] = null;
        }

        let existingParams = existingCriteria.secrets;
        for(var key in existingParams) {
            if(!this.secrets.hasOwnProperty(key))
                this.secrets[key] = null;
        }
        var existingEnv = existingCriteria.env;
        for(var key in existingEnv) {
            if(!this.env.hasOwnProperty(key))
                this.env[key] = null;
        }
    }

    getCreateTestData(existingData:ExistingParams) {
        this.mergeExistingData(existingData);
        var data : TestModel = {
            testId: this.testId,
            description: this.description,
            displayName: this.displayName,
            loadTestConfiguration: {
                engineInstances: this.engineInstances,
                splitAllCSVs: this.splitAllCSVs,
                regionalLoadTestConfig : this.regionalLoadTestConfig,
            },
            secrets: this.secrets,
            kind : this.kind,
            certificate: this.certificates,
            environmentVariables: this.env,
            passFailCriteria:{
                passFailMetrics: this.passFailApiModel
            },
            autoStopCriteria: this.autoStop,
            subnetId: this.subnetId,
            publicIPDisabled : this.publicIPDisabled,
            keyvaultReferenceIdentityType: this.keyVaultReferenceIdentityType,
            keyvaultReferenceIdentityId: this.keyVaultReferenceIdentity,
        };
        return data;
    }

    getStartTestData() {
        this.runTimeParams.testId = this.testId;
        this.runTimeParams.testRunId = Util.getUniqueId();
        return this.runTimeParams;
    }

    getAutoStopCriteria(autoStopInput : AutoStopCriteriaObjYaml | string | null): AutoStopCriteria | null {
        let autoStop: AutoStopCriteria | null;
        if (autoStopInput == null) {autoStop = null; return autoStop;}
        if (typeof autoStopInput == "string") {
            if (autoStopInput == "disable") {
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