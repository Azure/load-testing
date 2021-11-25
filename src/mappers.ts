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
var configFiles: string[]=[];
var token='';
var resourceId='';
var subscriptionID='';
var tenantId='';
var YamlPath='';
var passFailCriteria: any[] = []

export interface criteriaObj {
    aggregate: string;
    clientmetric: string;
    condition: string;
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
let minValue: { [name: string]: number } = {};

function getExistingData() {
    var existingCriteria:any = index.getExistingCriteria();
    for(var key in existingCriteria) {
        failCriteria[key] = null;
    }
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
            engineSize: 'M',
            engineInstances: engineInstances
        },
        secrets: secretsYaml,
        environmentVariables: envYaml,
        passFailCriteria:{
            passFailMetrics: failCriteria
        }
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
    const formData = new FormData();
    let filedata = fs.readFileSync(filepath);
    var index = filepath.lastIndexOf('/');
    var filename = filepath.substring(index+1);
    formData.append('file',filedata,filename);
    return formData;
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
    var r = new RegExp(/[a-z0-9_-]+/);
    return r.test(value);
}
export async function getInputParams() {
    await getAccessToken("https://management.core.windows.net");
    YamlPath = core.getInput('loadTestConfigFile');
    const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
    testName = (config.testName).toLowerCase();
    if(!validateName(getFileName(testName)))
        throw "Invalid testName. Allowed chararcters are [a-z0-9-_]"
    testdesc = config.description;
    engineInstances = config.engineInstances;
    let path = YamlPath.substr(0, YamlPath.lastIndexOf('/')+1);
    testPlan = path + config.testPlan;
    if(!validateName(getFileName(config.testPlan)))
        throw "Invalid testPlan name. Allowed chararcters are [a-z0-9-_]"
    if(config.configurationFiles != null) {
        var tempconfigFiles: string[]=[];
        tempconfigFiles = config.configurationFiles;
        tempconfigFiles.forEach(file => {
            if(!validateName(getFileName(file)))
                throw "Invalid configuration filename. Allowed chararcters are [a-z0-9-_]";
            file = path + file;
            configFiles.push(file);
        });
    }
    if(config.failureCriteria != undefined) {
        passFailCriteria = config.failureCriteria;
        getPassFailCriteria();
    }
    if(config.secrets != undefined) {
        getParameters(config.secrets, "secrets");
    }
    if(config.env != undefined) {
        getParameters(config.env, "env");
    }
    getRunTimeParams();
    if(testName === '' || testPlan === '') {
        throw "Missing required fields ";
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
            if(!validateUrl(val.value))
                throw "Invalid secret URI";
            secretsYaml[val.name] = {type: 'AKV_SECRET_URI',value: val.value};
        }
    }
    else if(type == "env") {
        for(var index in obj) {
            var val = obj[index];
            envYaml[val.name] = val.value;
        }
    }
}
function validateUrl(url:string) 
{
    var r = new RegExp(/(http|https):\/\/.*\/secrets\/[/a-zA-Z0-9]+$/);
    return r.test(url);
}
function validateValue(value:string) 
{
    var r = new RegExp(/[a-zA-Z0-9-_]+/);
    return r.test(value);
}
function getRunTimeParams() {
    var secretRun = core.getInput('secrets');
    if(secretRun != "") {
        try {
            var obj = JSON.parse(secretRun);
            for (var index in obj) {
                var val = obj[index];
                if(!validateValue(val.value))
                    throw "Invalid secret value"; 
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
            action: "",
            actualValue: 0,
            result: null
        }
        if(typeof criteria !== "string"){
            var request = Object.keys(criteria)[0]
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
    getFailureCriteria();
}
function ValidateAndAddCriteria(data:any) {
    if(data.action == "")
        data.action = "continue"
    data.value = util.removeUnits(data.value);
    if(!util.validCriteria(data)) 
        throw "Invalid Criteria";
    var key = data.clientmetric+' '+data.aggregate+' '+data.condition+' '+data.action;
    var minVal = data.value;
    var currVal=minVal;
    if(minValue.hasOwnProperty(key))
        currVal = minValue[key];
    minValue[key] = (minVal<currVal)? minVal: currVal;
}
function getFailureCriteria() {
    for(var key in minValue) {
        var splitted = key.split(" "); 
        failCriteria[util.getUniqueId()] = {
            clientmetric: splitted[0],
            aggregate: splitted[1],
            condition: splitted[2],
            value: minValue[key],
            action: splitted[3],
            actualValue: 0,
            result: null,
        };
    }
}