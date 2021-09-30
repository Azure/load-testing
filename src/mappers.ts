import { IHeaders } from 'typed-rest-client/Interfaces';
import * as core from '@actions/core'
const yaml = require('js-yaml');
const jwt_decode = require('jwt-decode');
import * as fs from 'fs';
var FormData = require('form-data');
var AuthenticationContext = require('adal-node').AuthenticationContext;

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
var clientId='';
var clientkey='';
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
    if(token == '') {
        var tokenRes:any = await getTokenAPI();
        token = tokenRes.accessToken;
    }
    let headers: IHeaders = {
        'content-type': 'application/merge-patch+json',
        'Authorization': 'Bearer '+ token
    };
    return headers;
}

export function uploadFileData(filepath: string) {
    const formData = new FormData();
    let filedata = fs.readFileSync(filepath);
    var index = filepath.lastIndexOf('//');
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
        var tokenRes:any = await getTokenAPI();
        token = tokenRes.accessToken;
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

async function getTokenAPI() 
{  
    var authorityHostUrl = 'https://login.windows.net';
    var authorityUrl = authorityHostUrl + '/' + tenantId;
    var resource = 'https://loadtest.azure-dev.com'; 
    var context = new AuthenticationContext(authorityUrl);
    return new Promise((resolve, reject) => {
        context.acquireTokenWithClientCredentials(resource, clientId, clientkey, (err:any, token:any) => {
            if (err) {
            reject(err);
            } else {
            resolve(token);
            }
        });
    });
}
export function getResourceId() {
    const rg: string = core.getInput('resourceGroup');
    const ltres: string = core.getInput('loadtestResource');
    resourceId = "/subscriptions/"+subscriptionID+"/resourcegroups/"+rg+"/providers/microsoft.loadtestservice/loadtests/"+ltres;
    return resourceId;
}

export function getInputParams() {
    try {
        getAuthInputs();
        YamlPath = core.getInput('YAMLFilePath');
        const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
        testName = (config.testName).toLowerCase();
        testdesc = config.description;
        engineInstances = config.engineInstances;
        engineSize = config.engineSize;
        let path = YamlPath.substr(0, YamlPath.indexOf('//')+1);
        testPlan = path + config.testPlan;
        if(config.configurationFiles != null) {
            configFiles = config.configurationFiles;
            configFiles.forEach(file => {
                file = path + file;
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

async function getAuthInputs() {
    var credentials: string = core.getInput('azuresubscription');
    let credsObject: { [key: string]: string };
    try {
      credsObject = JSON.parse(credentials);
      
    } catch (ex) {
      throw new Error("Credentials object is not a valid JSON");
    }
  
    clientId = credsObject["clientId"];
    clientkey = credsObject["clientSecret"];
    tenantId = credsObject["tenantId"];
    subscriptionID = credsObject["subscriptionId"];
    if(clientId == '' || clientkey == '' || tenantId == '' || subscriptionID == '' )
    throw new Error(
        "Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionID are supplied in the provided object"
      );
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
    var index = filepath.lastIndexOf('//');
    var filename = filepath.substring(index+1);
    var extIndex = filename.indexOf('.');
    if(extIndex != -1)
        filename = filename.substring(0,extIndex);
    return filename.toLowerCase();
}

export function getTenantId() {
    return tenantId;
}