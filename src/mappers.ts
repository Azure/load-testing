import { IHeaders } from 'typed-rest-client/Interfaces';
import * as core from '@actions/core'
const yaml = require('js-yaml');
const jwt_decode = require('jwt-decode');
import * as fs from 'fs';
var FormData = require('form-data');
import { execFile } from "child_process";
import * as util from './util';
import * as index from './main';
var testName='';
var testdesc = 'SampleTest';
var engineInstances='1';
var testPlan='';
var propertyFile: string|null=null;
var configFiles: string[]=[];
var token='';
var resourceId='';
var subscriptionID='';
var tenantId='';
var YamlPath='';
var passFailCriteria: any[] = [];
var kvRefId: string|null =null;
var kvRefType: string|null=null;
var subnetId: string|null=null;
var splitCSVs: boolean|null=null;
var certificates : certObj|null = null;

export interface certObj {
    type: string;
    value: string;
    name: string;
};
export interface criteriaObj {
    aggregate: string;
    clientmetric: string;
    condition: string;
    requestName: string | null;
    value: number;
    action: string;
    actualValue: number;
    result: null;
};
export interface paramObj {
    type: string;
    value: string;
};

let failCriteria: { [name: string]: criteriaObj|null } = {};
let secretsYaml: { [name: string]: paramObj|null } = {};
let secretsRun: { [name: string]: paramObj } = {};
let envYaml: { [name: string]: string|null } = {};
let envRun: { [name: string]: string } = {};
let failureCriteriaValue: { [name: string]: number } = {}

function getExistingData() {
    var existingCriteria: { [name: string]: criteriaObj|null } = index.getExistingCriteria();
    var existingCriteriaIds: string[] = Object.keys(existingCriteria);
    getFailureCriteria(existingCriteriaIds);

    var existingParams:any = index.getExistingParams();
    for(var key in existingParams) {
        if(!secretsYaml.hasOwnProperty(key))
            secretsYaml[key] = null;
    }
    var existingEnv:any = index.getExistingEnv();
    for(var key in existingEnv) {
        if(!envYaml.hasOwnProperty(key))
            envYaml[key] = null;
    }
}
export function createTestData() {
    getExistingData();
    var data = {
        testId: testName,
        description: testdesc,
        displayName: testName,
        resourceId: resourceId,
        loadTestConfig: {
            engineInstances: engineInstances,
            splitAllCSVs: splitCSVs
        },
        secrets: secretsYaml,
        certificate:certificates,
        environmentVariables: envYaml,
        passFailCriteria:{
            passFailMetrics: failCriteria
        },
        subnetId: subnetId,
        keyvaultReferenceIdentityType: kvRefType,
        keyvaultReferenceIdentityId: kvRefId
    };
    return data;
}

export async function createTestHeader() {
    let headers: IHeaders = {
        'content-type': 'application/merge-patch+json',
        'Authorization': 'Bearer '+ token
    };
    return headers;
}

export function uploadFileData(filepath: string) {
    try
    {
        const formData = new FormData(); 
        let filedata = fs.readFileSync(filepath);
        var index = filepath.lastIndexOf('/');
        var filename = filepath.substring(index+1);
        formData.append('file',filedata,filename);
        return formData;
    }
    catch(err:any) {
        err.message = "File not found "+ filepath;
        throw new Error(err.message);
    }
}

export async function UploadAndValidateHeader(formData:any) {
    let headers: IHeaders = {
        'Authorization': 'Bearer '+ token , 
        'content-type':`multipart/form-data; boundary=${formData.getBoundary()}`
    };
    return headers;
}
export function dataPlaneHeader() {
    let headers: IHeaders = {
        'Authorization': 'Bearer '+ token
    };
    return headers;
}
export function startTestData(testRunName:string) {
    var data = {
        testRunId: testRunName,
        displayName: getDefaultTestRunName(),
        testId: testName,
        resourceId: resourceId,
        description: "Sample testRun",
        secrets: secretsRun,
        environmentVariables: envRun
    };
    return data;
}
export async function getTestRunHeader() {
    if(!isExpired()) {
        await getAccessToken("https://loadtest.azure-dev.com");
    }
    let headers: IHeaders = {
        'content-type': 'application/json',
        'Authorization': 'Bearer '+ token
    };
    return headers;
}

function isExpired() {
    const header = jwt_decode(token)
    const now = Math.floor(Date.now() / 1000)
    return header && header.exp > now
}
export async function getTestHeader() {
    await getAccessToken("https://loadtest.azure-dev.com");
    let headers: IHeaders = {
        'content-type': 'application/json',
        'Authorization': 'Bearer '+ token
    };
    return headers;
}
export function getResourceId() {
    const rg: string = core.getInput('resourceGroup');
    const ltres: string = core.getInput('loadTestResource');
    resourceId = "/subscriptions/"+subscriptionID+"/resourcegroups/"+rg+"/providers/microsoft.loadtestservice/loadtests/"+ltres;
    return resourceId;
}
function validateName(value:string) 
{
    var r = new RegExp(/[^a-zA-Z0-9_-]/);
    return r.test(value);
}
export async function getInputParams() {
    await getAccessToken("https://management.core.windows.net");
    YamlPath = core.getInput('loadTestConfigFile');
    if(!(YamlPath.includes(".yaml") || YamlPath.includes(".yml")))
        throw new Error("The Load Test configuration file should be of type .yaml or .yml");
    const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
    if(config.testName == null || config.testName == undefined)
        throw new Error("The required field testName is missing in "+YamlPath+".");
    testName = (config.testName).toLowerCase();
    if(validateName(testName))
        throw new Error("Invalid testName. Allowed chararcters are [a-zA-Z0-9-_]");
    testdesc = config.description;
    engineInstances = config.engineInstances;
    let path = YamlPath.substr(0, YamlPath.lastIndexOf('/')+1);
    if(config.testPlan == null || config.testPlan == undefined)
        throw new Error("The required field testPlan is missing in "+YamlPath+".");
    testPlan = path + config.testPlan;
    if(validateName(getFileName(config.testPlan))) {
        throw new Error("Invalid testPlan name. Allowed chararcters are [a-zA-Z0-9-_]");
    }
    if(config.configurationFiles != null) {
        var tempconfigFiles: string[]=[];
        tempconfigFiles = config.configurationFiles;
        tempconfigFiles.forEach(file => {
            if(validateName(getFileName(file)))
                throw new Error("Invalid configuration filename. Allowed chararcters are [a-z0-9-_]");
            file = path + file;
            configFiles.push(file);
        });
    }
    if(config.splitAllCSVs !=undefined){
        splitCSVs = config.splitAllCSVs;
    }
    if(config.failureCriteria != undefined) {
        passFailCriteria = config.failureCriteria;
        getPassFailCriteria();
    }
    if(config.subnetId != undefined) {
        subnetId = config.subnetId
    }
    if(config.properties != undefined)
    {
        var propFile = config.properties.userPropertyFile;
        propertyFile = path + propFile;
    }
    if(config.secrets != undefined) {
        kvRefType='SystemAssigned';
        getParameters(config.secrets, "secrets");
    }
    if(config.env != undefined) {
        getParameters(config.env, "env");
    }
    if(config.certificates != undefined){
        getParameters(config.certificates,"certificates");
    }
    if(config.keyVaultReferenceIdentity != undefined) {
        kvRefType='UserAssigned';
        kvRefId = config.keyVaultReferenceIdentity;
    }
    getRunTimeParams();
    if(testName === '' || testPlan === '') {
        throw new Error("The required fields testName/testPlan are missing in "+YamlPath+".");
    }
}

export async function getSubName() {
    try {
        const cmdArguments = ["account", "show"];
        var result: any = await execAz(cmdArguments);
        let name = result.name;
        return name;
    } 
    catch (err:any) {
      const message =
        `An error occurred while getting credentials from ` + `Azure CLI: ${err.stack}`;
      throw new Error(message);
    }
  }

async function getAccessToken(aud:string) {
    try {
        const cmdArguments = ["account", "get-access-token", "--resource"];
        cmdArguments.push(aud);
        var result: any = await execAz(cmdArguments);
        token = result.accessToken;
        subscriptionID = result.subscription;
        tenantId = result.tenant;
        return token;
    } 
    catch (err:any) {
      const message =
        `An error occurred while getting credentials from ` + `Azure CLI: ${err.stack}`;
      throw new Error(message);
    }
  }

async function execAz(cmdArguments: string[]): Promise<any> {
    const azCmd = process.platform === "win32" ? "az.cmd" : "az";
    return new Promise<any>((resolve, reject) => {
      execFile(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8" }, (error:any, stdout:any) => {
        if (error) {
          return reject(error);
        }
        try {
          return resolve(JSON.parse(stdout));
        } catch (err:any) {
          const msg =
            `An error occurred while parsing the output "${stdout}", of ` +
            `the cmd az "${cmdArguments}": ${err.stack}.`;
          return reject(new Error(msg));
        }
      });
    });
  }
  export function getDefaultTestName()
  {
    const a = (new Date(Date.now())).toLocaleString()
    const b = a.split(", ")
    const c = a.split(" ")
    return "Test_"+b[0]+"_"+c[1]+c[2]

}

export function getDefaultTestRunName()
{
    const a = (new Date(Date.now())).toLocaleString()
    const b = a.split(", ")
    const c = a.split(" ")
    return "TestRun_"+b[0]+"_"+c[1]+c[2]
}
function getParameters(obj:any, type:string) {
    if(type == "secrets") {
        for (var index in obj) {
            var val = obj[index];
            if(!validateUrl(val.value)) {
                throw new Error("Invalid secret URI");
            }
            secretsYaml[val.name] = {type: 'AKV_SECRET_URI',value: val.value};
        }
    }
    else if(type == "env") {
        for(var index in obj) {
            var val = obj[index];
            envYaml[val.name] = val.value;
        }
    }
    else if(type == "certificates"){
        for (var index in obj) {
            var val = obj[index];
            if(!validateUrl(val.value))
                throw new Error("Invalid certificate url");
            certificates = {name: val.name, type: 'AKV_CERT_URI',value: val.value};
            break;
        }
    }
}
function validateUrl(url:string) 
{
    //var r = new RegExp(/(http|https):\/\/.*\/secrets\/[/a-zA-Z0-9]+$/);
    var pattern: any = /https:\/\/+[a-zA-Z0-9_-]+\.+(?:vault|vault-int)+\.+(?:azure|azure-int|usgovcloudapi|microsoftazure)+\.+(?:net|cn|de)+\/+(?:secrets|certificates|keys|storage)+\/+[a-zA-Z0-9_-]+\/+|[a-zA-Z0-9]+$/;
    var r = new RegExp(pattern);
    return r.test(url);
}
function validateValue(value:string) 
{
    var r = new RegExp(/[^a-zA-Z0-9-_]/);
    return r.test(value);
}
function getRunTimeParams() {
    var secretRun = core.getInput('secrets');
    if(secretRun != "") {
        try {
            var obj = JSON.parse(secretRun);
            for (var index in obj) {
                var val = obj[index];
                /*if(validateValue(val.value)) {
                    throw new Error("Invalid secret value"); 
                }*/
                secretsRun[val.name] = {type: 'SECRET_VALUE',value: val.value};
            }
        }
        catch (error) {
            throw new Error("Invalid secrets");
        }
    }
    var eRun = core.getInput('env');
    if(eRun != "") {
        try {
            var obj = JSON.parse(eRun);
            for (var index in obj) {
                var val = obj[index];
                envRun[val.name] = val.value;
            }
        }
        catch (error) {
            throw new Error("Invalid env");
        }
    }    
}
export function getYamlPath() {
    return YamlPath;
}
export function getTestFile() {
    return testPlan;
}
export function getPropertyFile() {
    return propertyFile;
}
export function getConfigFiles() {
    return configFiles;
}

export function getTestName() {
    return testName;
}

export function getFileName(filepath:string) {
    var index = filepath.lastIndexOf('/');
    var filename = filepath.substring(index+1);
    var extIndex = filename.indexOf('.');
    if(extIndex != -1)
        filename = filename.substring(0,extIndex);
    return filename.toLowerCase();
}

export function getTenantId() {
    return tenantId;
}
function getPassFailCriteria() {
    passFailCriteria.forEach(criteria => {
        let data = {
            aggregate: "",
            clientmetric: "",
            condition: "",
            value: "",
            requestName: "",
            action: "",
            actualValue: 0,
            result: null
        }
        if(typeof criteria !== "string"){
            var request = Object.keys(criteria)[0]
            data.requestName = request;
            criteria = criteria[request]
        }
        let tempStr: string = "";
        for(let i=0; i<criteria.length; i++){
            if(criteria[i] == '('){
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if(criteria[i] == ')'){
                data.clientmetric = tempStr;
                tempStr = "";
            }
            else if(criteria[i] == ','){
                data.condition = tempStr.substring(0, util.indexOfFirstDigit(tempStr)).trim();
                data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
                tempStr = "";
            }
            else{
                tempStr += criteria[i];
            }
        }
        if(criteria.indexOf(',') != -1){
            data.action = tempStr.trim()
        } 
        else{
            data.condition = tempStr.substring(0, util.indexOfFirstDigit(tempStr)).trim();
            data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
        } 
        ValidateAndAddCriteria(data);
    });
}
function ValidateAndAddCriteria(data:any) {
    if(data.action == "")
        data.action = "continue"
    data.value = util.removeUnits(data.value);
    if(!util.validCriteria(data)) 
        throw new Error("Invalid Failure Criteria");
    var key: string = data.clientmetric+' '+data.aggregate+' '+data.condition+' '+data.action;
    if(data.requestName != ""){
        key = key + ' ' + data.requestName;
    }
    var val: number = parseInt(data.value);
    var currVal = val;
    if(failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if(data.condition == '>'){
        failureCriteriaValue[key] = (val<currVal) ? val : currVal;
    }
    else{
        failureCriteriaValue[key] = (val>currVal) ? val : currVal;
    }
}
function getFailureCriteria(existingCriteriaIds: string[]) {
    var numberOfExistingCriteria = existingCriteriaIds.length;
    var index = 0;
    for(var key in failureCriteriaValue) {
        var splitted = key.split(" "); 
        var criteriaId = index < numberOfExistingCriteria ? existingCriteriaIds[index++] : util.getUniqueId();
        failCriteria[criteriaId] = {
            clientmetric: splitted[0],
            aggregate: splitted[1],
            condition: splitted[2],
            value: failureCriteriaValue[key],
            action: splitted[3],
            actualValue: 0,
            result: null,
            requestName: splitted.length > 4 ? splitted[4] : null
        };
    }
    for(; index < numberOfExistingCriteria; index++){
        failCriteria[existingCriteriaIds[index]] = null;
    }
}