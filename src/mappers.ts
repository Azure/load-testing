import { IHeaders } from 'typed-rest-client/Interfaces';
import * as core from '@actions/core'
const yaml = require('js-yaml');
const jwt_decode = require('jwt-decode');
import * as fs from 'fs';
var FormData = require('form-data');
import { execFile } from "child_process";

var testName='';
var testdesc = 'SampleTest';
var engineSize='s';
var engineInstances='1';
var testPlan='';
var configFiles: string[]=[];
var token='';
var resourceId='';
var subscriptionID='';
var tenantId='';
var YamlPath='';

export function createTestData() {
    var data = {
        testId: testName,
        description: testdesc,
        displayName: testName,
        resourceId: resourceId,
        loadTestConfig: {
            engineSize: engineSize,
            engineInstances: engineInstances
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

export function startTestData(testRunName:string) {
    var data = {
        testRunId: testRunName,
        displayName: testRunName,
        testId: testName,
        resourceId: resourceId,
        description: "Sample testRun"
    };
    return data;
}
export async function getTestRunHeader() {
    if(!isExpired()) {
        await getAccessToken();
    }
    let headers: IHeaders = {
        'content-type': 'application/json',
        'Authorization': 'Bearer '+ token
    };
    return headers;
}

async function isExpired() {
    const header = jwt_decode(token)
    const now = Math.floor(Date.now() / 1000)
    return header && header.exp > now
}

export function getResourceId() {
    const rg: string = core.getInput('resourceGroup');
    const ltres: string = core.getInput('loadtestResource');
    resourceId = "/subscriptions/"+subscriptionID+"/resourcegroups/"+rg+"/providers/microsoft.loadtestservice/loadtests/"+ltres;
    return resourceId;
}

export async function getInputParams() {
    try {
        await getAccessToken();
        YamlPath = core.getInput('YAMLFilePath');
        const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
        testName = (config.testName).toLowerCase();
        testdesc = config.description;
        engineInstances = config.engineInstances;
        engineSize = config.engineSize;
        let path = YamlPath.substr(0, YamlPath.lastIndexOf('/')+1);
        testPlan = path + config.testPlan;
        if(config.configurationFiles != null) {
            var tempconfigFiles: string[]=[];
            tempconfigFiles = config.configurationFiles;
            tempconfigFiles.forEach(file => {
                file = path + file;
                configFiles.push(file);
            });
        }
        if(testName === '' || testPlan === '') {
            throw "Missing required fields ";
        }
    } catch (e:any) {
        e.message = "Missing required fields ";
        throw e;
    }
}

async function getAccessToken() {
    try {
        let aud = "https://loadtest.azure-dev.com";
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