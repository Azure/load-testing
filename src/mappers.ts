import { IHeaders } from "typed-rest-client/Interfaces";
import * as core from "@actions/core";
const yaml = require("js-yaml");
import * as jwt_decode from "jwt-decode";
import * as fs from "fs";
import { execFile } from "child_process";
import * as util from './util';
import * as index from './main';
import { isNullOrUndefined } from 'util';
const pathLib = require('path');
import { TestKind } from "./util";

var testId = "";
var displayName = "";
var testdesc = "SampleTest";
var engineInstances = "1";
var testPlan = "";
var propertyFile: string | null = null;
var configFiles: string[] = [];
var zipFiles : string[]=[];
var token = "";
var resourceId = "";
var subscriptionID = "";
var environment="AzureCloud";
var armTokenScope="https://management.core.windows.net";
var dataPlaneTokenScope="https://loadtest.azure-dev.com";
var armEndpoint="https://management.azure.com";
var tenantId = "";
var yamlFile = "";
var passFailCriteria: any[] = [];
var regionalLoadTestConfig: regionConfiguration[] | null = null;
var autoStop: autoStopCriteriaObjOut | null = null;
var kvRefId: string | null = null;
var kvRefType: string | null = null;
var subnetId: string | null = null;
var splitCSVs: boolean | null = null;
var certificate: certObj | null = null;
let kind : TestKind;
let publicIPDisabled : boolean = false;

export interface certObj {
  type: string;
  value: string;
  name: string;
}
export interface criteriaObj {
  aggregate: string;
  clientMetric: string;
  condition: string;
  requestName: string | null;
  action: string | null;
  value: number;
}
export interface autoStopCriteriaObjIn {
  autoStopEnabled? : boolean;
  errorPercentage ?: number;
  timeWindow ?: number;
}
export interface autoStopCriteriaObjOut {
  autoStopDisabled? : boolean;
  errorRate ?: number;
  errorRateTimeWindowInSeconds ?: number;
}

export interface regionConfiguration {
  region: string;
  engineInstances: number;
};

export interface paramObj {
  type: string;
  value: string;
}
enum paramType {
  env = "env",
  secrets = "secrets",
  cert = "cert"
}
let failCriteria: { [name: string]: criteriaObj | null } = {};
let secretsYaml: { [name: string]: paramObj | null } = {};
let secretsRun: { [name: string]: paramObj } = {};
let envYaml: { [name: string]: string | null } = {};
let envRun: { [name: string]: string } = {};
let failureCriteriaValue: { [name: string]: number } = {};

function getExistingData() {
  var existingCriteria: { [name: string]: criteriaObj | null } =
    index.getExistingCriteria();
  var existingCriteriaIds: string[] = Object.keys(existingCriteria);
  getFailureCriteria(existingCriteriaIds);

  var existingParams: any = index.getExistingParams();
  for (var key in existingParams) {
    if (!secretsYaml.hasOwnProperty(key)) secretsYaml[key] = null;
  }
  var existingEnv: any = index.getExistingEnv();
  for (var key in existingEnv) {
    if (!envYaml.hasOwnProperty(key)) envYaml[key] = null;
  }
}
export function createTestData() {
  getExistingData();
  var data = {
    testId: testId,
    description: testdesc,
    displayName: displayName,
    quickStartTest : false, // always quick test will be false because gh-actions doesnot support it now.
    loadTestConfiguration: {
      engineInstances: engineInstances,
      splitAllCSVs: splitCSVs,
      optionalLoadTestConfig : null,
      regionalLoadTestConfig : regionalLoadTestConfig,
    },
    secrets: secretsYaml,
    kind : kind,
    certificate: certificate,
    environmentVariables: envYaml,
    passFailCriteria: {
      passFailMetrics: failCriteria,
    },
    autoStopCriteria: autoStop,
    subnetId: subnetId,
    publicIPDisabled : publicIPDisabled,
    keyvaultReferenceIdentityType: kvRefType,
    keyvaultReferenceIdentityId: kvRefId,
  };
  return data;
}

export async function createTestHeader() {
  let headers: IHeaders = {
    "content-type": "application/merge-patch+json",
    Authorization: "Bearer " + token,
  };
  return headers;
}

export async function UploadAndValidateHeader() {
  let headers: IHeaders = {
    Authorization: "Bearer " + token,
    "content-type": "application/octet-stream",
  };
  return headers;
}
export function armTokenHeader() {
  let headers: IHeaders = {
    Authorization: "Bearer " + token,
  };
  return headers;
}
export function startTestData(
  testRunName: string,
  runDisplayName: string,
  runDescription: string
) {
  var data = {
    testRunId: testRunName,
    displayName: runDisplayName ? runDisplayName : getDefaultTestRunName(),
    description: runDescription
      ? runDescription
      : "Started using GitHub Actions",
    testId: testId,
    secrets: secretsRun,
    environmentVariables: envRun,
  };
  return data;
}
export async function getTestRunHeader() {
  if (!isExpired()) {
    await getAccessToken(dataPlaneTokenScope);
  }
  let headers: IHeaders = {
    "content-type": "application/json",
    Authorization: "Bearer " + token,
  };
  return headers;
}

function isExpired() {
  const header = jwt_decode.jwtDecode(token);
  const now = Math.floor(Date.now() / 1000);
  return header && header.exp && header.exp > now;
}
export async function getTestHeader() {
  await getAccessToken(dataPlaneTokenScope);
  let headers: IHeaders = {
    "content-type": "application/json",
    Authorization: "Bearer " + token,
  };
  return headers;
}
export function getResourceId() {
  const rg: string = core.getInput("resourceGroup");
  const ltres: string = core.getInput("loadTestResource");
  if(isNullOrUndefined(rg) || rg == ''){
    throw new Error(`The input field "resourceGroup" is empty. Provide an existing resource group name.`);
  }
  if(isNullOrUndefined(ltres) || ltres == ''){
      throw new Error(`The input field "loadTestResource" is empty. Provide an existing load test resource name.`);
  }
  resourceId = "/subscriptions/" + subscriptionID + "/resourcegroups/" + rg + "/providers/microsoft.loadtestservice/loadtests/" + ltres;
  return resourceId;
}
export async function getInputParams() {
  await setEndpointAndScope();
  await getAccessToken(armTokenScope);
  yamlFile = core.getInput("loadTestConfigFile");
  if(isNullOrUndefined(yamlFile) || yamlFile == ''){
    throw new Error(`The input field "loadTestConfigFile" is empty. Provide the path to load test yaml file.`);
  }
  if (
    !(
      pathLib.extname(yamlFile) === ".yaml" ||
      pathLib.extname(yamlFile) === ".yml"
    )
  )
    throw new Error(
      "The Load Test configuration file should be of type .yaml or .yml"
    );
  const config = yaml.load(fs.readFileSync(yamlFile, "utf8"));
  
  let validConfig : {valid : boolean, error :string} = util.checkValidityYaml(config);
  if(!validConfig.valid){
      throw new Error(validConfig.error + ` Refer to the load test YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml`);
  }
  testId = config.testId ?? config.testName;
  testId = testId.toLowerCase();
  displayName = config.displayName ?? testId;

  testdesc = config.description;
  engineInstances = config.engineInstances ?? 1;

  let path = pathLib.dirname(yamlFile);
  testPlan = pathLib.join(path, config.testPlan);
  kind = config.testType ?? TestKind.JMX;

  if (config.configurationFiles != null) {
    let tempconfigFiles: string[] = [];
    tempconfigFiles = config.configurationFiles;
    for(let file of tempconfigFiles){
      if(kind == TestKind.URL && !util.checkFileType(file,'csv')){
        throw new Error("Only CSV files are allowed as configuration files for a URL-based test.");
      }
      file = pathLib.join(path, file);
      configFiles.push(file);
    }
  }
  if(config.zipArtifacts != undefined){
    let tempZipFiles: string[]=[];
    tempZipFiles = config.zipArtifacts;
    if(kind == TestKind.URL && tempZipFiles.length > 0){
        throw new Error("Zip artifacts are not supported for the URL-based test.");
    }
    for(let file of tempZipFiles){
        file = pathLib.join(path,file);
        zipFiles.push(file);
    };
  }
  if (config.splitAllCSVs != undefined) {
    splitCSVs = config.splitAllCSVs;
  }
  if (config.failureCriteria != undefined) {
    passFailCriteria = config.failureCriteria;
    getPassFailCriteria();
  }
  if (config.subnetId != undefined) {
    subnetId = config.subnetId;
  }
  if(config.publicIPDisabled != undefined) {
    publicIPDisabled = (config.publicIPDisabled)
  }
  if(config.properties != undefined && config.properties.userPropertyFile != undefined)
  {
      if(!util.checkFileType(config.properties.userPropertyFile, 'properties')){
        throw new Error("User property file with extension other than '.properties' is not permitted.");
      }
      if(kind == TestKind.URL){
          throw new Error("User property file is not supported for the URL-based test.");
      }
      var propFile = config.properties.userPropertyFile;
      propertyFile = pathLib.join(path,propFile);
  }
  if (config.secrets != undefined) {
    kvRefType = "SystemAssigned";
    getParameters(config.secrets, paramType.secrets);
  }
  if (config.env != undefined) {
    getParameters(config.env, paramType.env);
  }
  if (config.certificates != undefined) {
    getParameters(config.certificates, paramType.cert);
  }
  if (config.autoStop != undefined) {
    getAutoStopCriteria(config.autoStop);
  }

  if (config.keyVaultReferenceIdentity != undefined) {
    kvRefType = "UserAssigned";
    kvRefId = config.keyVaultReferenceIdentity;
  }
  if(config.regionalLoadTestConfig != undefined) {
    regionalLoadTestConfig = getMultiRegionLoadTestConfig(config.regionalLoadTestConfig);
  }
  getRunTimeParams();
  validateTestRunParams();
  if (
    testId === "" ||
    isNullOrUndefined(testId) ||
    testPlan === "" ||
    isNullOrUndefined(testPlan)
  ) {
    throw new Error(
      "The required fields testName/testPlan are missing in " + yamlFile + "."
    );
  }
}

export async function getSubName() {
  try {
    const cmdArguments = ["account", "show"];
    var result: any = await execAz(cmdArguments);
    let name = result.name;
    return name;
  } catch (err: any) {
    const message =
      `An error occurred while getting credentials from ` +
      `Azure CLI: ${err.message}` + ` for getting subscription name.`;
    throw new Error(message);
  }
}
function isValidTestKind(value: string): value is TestKind {
  return Object.values(TestKind).includes(value as TestKind);
}
async function getAccessToken(aud: string) {
  try {
    const cmdArguments = ["account", "get-access-token", "--resource"];
    cmdArguments.push(aud);
    var result: any = await execAz(cmdArguments);
    token = result.accessToken;
    subscriptionID = result.subscription;
    tenantId = result.tenant;
    return token;
  } catch (err: any) {
    const message =
      `An error occurred while getting credentials from ` +
      `Azure CLI: ${err.message}` + ` for getting access token.`;
    throw new Error(message);
  }
}

async function setEndpointAndScope() {
  try {
    const cmdArguments = ["cloud", "show"];
    var result: any = await execAz(cmdArguments);
    let env = result ? result.name : null;
    environment = env ? env : environment;
    let endpointUrl = (result && result.endpoints) ? result.endpoints.resourceManager : null;
    armEndpoint = endpointUrl ? endpointUrl : armEndpoint;

    if(environment == 'AzureUSGovernment'){
      dataPlaneTokenScope = 'https://cnt-prod.loadtesting.azure.us';
      armTokenScope = 'https://management.usgovcloudapi.net';
    }
  } catch (err: any) {
    const message =
      `An error occurred while getting credentials from ` +
      `Azure CLI: ${err.message}` + ` for setting endPoint and scope.`;
    throw new Error(message);
  }
}

async function execAz(cmdArguments: string[]): Promise<any> {
  const azCmd = process.platform === "win32" ? "az.cmd" : "az";
  return new Promise<any>((resolve, reject) => {
    execFile(
      azCmd,
      [...cmdArguments, "--out", "json"],
      { encoding: "utf8", shell: true },
      (error: any, stdout: any) => {
        if (error) {
          return reject(error);
        }
        try {
          return resolve(JSON.parse(stdout));
        } catch (err: any) {
          const msg =
            `An error occurred while parsing the output "${stdout}", of ` +
            `the cmd az "${cmdArguments}": ${err.nmessage}.`;
          return reject(new Error(msg));
        }
      }
    );
  });
}
export function getDefaultTestName() {
  const a = new Date(Date.now()).toLocaleString();
  const b = a.split(", ");
  const c = a.split(" ");
  return "Test_" + b[0] + "_" + c[1] + c[2];
}

export function getDefaultTestRunName() {
  const a = new Date(Date.now()).toLocaleString();
  const b = a.split(", ");
  const c = a.split(" ");
  return "TestRun_" + b[0] + "_" + c[1] + c[2];
}
function getParameters(obj: any, type: paramType) {
  if (type == paramType.secrets) {
    for (var index in obj) {
      var val = obj[index];
      let str : string =  `name : ${val.name}, value : ${val.value}`;
      if(isNullOrUndefined(val.name)){
          throw new Error(`Invalid secret name at ${str}`);
      }
      if(!validateUrl(val.value)){
          throw new Error(`Invalid secret url at ${str}`);
      }
      secretsYaml[val.name] = { type: "AKV_SECRET_URI", value: val.value };
    }
  } else if (type == paramType.env) {
    for (var index in obj) {
      var val = obj[index];
      let str : string =  `name : ${val.name}, value : ${val.value}`;
      if(isNullOrUndefined(val.name)){
          throw new Error(`Invalid environment name at ${str}`);
      }
      envYaml[val.name] = val.value;
    }
  } else if (type == paramType.cert) {
    for (var index in obj) {
      var val = obj[index];
      let str : string =  `name : ${val.name}, value : ${val.value}`;
      if(isNullOrUndefined(val.name)){
          throw new Error(`Invalid certificate name at ${str}`);
      }
      if(!validateUrl(val.value))
          throw new Error(`Invalid certificate url at ${str}`);
      certificate = { name: val.name, type: "AKV_CERT_URI", value: val.value };
      break;
    }
  }
}
function validateUrl(url: string) {
  //var r = new RegExp(/(http|https):\/\/.*\/secrets\/[/a-zA-Z0-9]+$/);
  var pattern: any =
    /https:\/\/+[a-zA-Z0-9_-]+\.+(?:vault|vault-int)+\.+(?:azure|azure-int|usgovcloudapi|microsoftazure)+\.+(?:net|cn|de)+\/+(?:secrets|certificates|keys|storage)+\/+[a-zA-Z0-9_-]+\/+|[a-zA-Z0-9]+$/;
  var r = new RegExp(pattern);
  return r.test(url);
}
function getRunTimeParams() {
  var secretRun = core.getInput("secrets");
  if (secretRun != "") {
    try {
      var obj = JSON.parse(secretRun);
      for (var index in obj) {
        var val = obj[index];
        let str : string =  `name : ${val.name}, value : ${val.value}`;
        if(isNullOrUndefined(val.name)){
            throw new Error(`Invalid secret name in the pipeline yaml file at ${str}`);
        }
        secretsRun[val.name] = { type: "SECRET_VALUE", value: val.value };
      }
    } catch (error) {
        console.log(error);
        throw new Error("Invalid format of secrets in the pipeline yaml file. Refer to the pipeline YAML syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-test-secured-endpoints?tabs=pipelines#reference-the-secret-in-the-load-test-configuration");
    }
  }
  var eRun = core.getInput("env");
  if (eRun != "") {
    try {
      var obj = JSON.parse(eRun);
      for (var index in obj) {
        var val = obj[index];
        let str : string =  `name : ${val.name}, value : ${val.value}`;
        if(isNullOrUndefined(val.name)){
            throw new Error(`Invalid environment name in the pipeline yaml file at ${str}`);
        }
        envRun[val.name] = val.value;
      }
    } catch (error) {
        console.log(error);
        throw new Error("Invalid format of env in the pipeline yaml file. Refer to the pipeline YAML syntax at : https://learn.microsoft.com/en-us/azure/load-testing/how-to-test-secured-endpoints?tabs=pipelines#reference-the-secret-in-the-load-test-configuration");        
      }
  }
}
function validateTestRunParams() {
  let runDisplayName: string = core.getInput("loadTestRunName");
  let runDescription: string = core.getInput("loadTestRunDescription");
  if (runDisplayName && util.invalidDisplayName(runDisplayName))
    throw new Error(
      "Invalid test run name. Test run name must be between 2 to 50 characters."
    );
  if (runDescription && util.invalidDescription(runDescription))
    throw new Error(
      "Invalid test run description. Test run description must be less than 100 characters."
    );
}
export function getTestKind(){
  return kind;
}
export function getYamlPath() {
  return yamlFile;
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
export function getZipFiles() {
  return zipFiles;
}
export function getTestId() {
  return testId;
}

export function getFileName(filepath: string) {
  var filename = pathLib.basename(filepath);
  return filename;
}

export function getTenantId() {
  return tenantId;
}
export function getARMEndpoint() {
  return armEndpoint;
}
function getPassFailCriteria() {
  passFailCriteria.forEach((criteria) => {
    let data = {
      aggregate: "",
      clientMetric: "",
      condition: "",
      value: "",
      requestName: "",
      action: "",
    };
    if (typeof criteria !== "string") {
      var request = Object.keys(criteria)[0];
      data.requestName = request;
      criteria = criteria[request];
    }
    let tempStr: string = "";
    for (let i = 0; i < criteria.length; i++) {
      if (criteria[i] == "(") {
        data.aggregate = tempStr.trim();
        tempStr = "";
      } else if (criteria[i] == ")") {
        data.clientMetric = tempStr;
        tempStr = "";
      } else if (criteria[i] == ",") {
        data.condition = tempStr
          .substring(0, util.indexOfFirstDigit(tempStr))
          .trim();
        data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
        tempStr = "";
      } else {
        tempStr += criteria[i];
      }
    }
    if (criteria.indexOf(",") != -1) {
      data.action = tempStr.trim();
    } else {
      data.condition = tempStr
        .substring(0, util.indexOfFirstDigit(tempStr))
        .trim();
      data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
    }
    ValidateAndAddCriteria(data);
  });
}
function ValidateAndAddCriteria(data: any) {
  if (data.action == "") data.action = "continue";
  data.value = util.removeUnits(data.value);
  if (!util.validCriteria(data)) throw new Error("Invalid Failure Criteria");
  var key: string =
    data.clientMetric +
    " " +
    data.aggregate +
    " " +
    data.condition +
    " " +
    data.action;
  if (data.requestName != "") {
    key = key + " " + data.requestName;
  }
  var val: number = parseInt(data.value);
  var currVal = val;
  if (failureCriteriaValue.hasOwnProperty(key))
    currVal = failureCriteriaValue[key];
  if (data.condition == ">") {
    failureCriteriaValue[key] = val < currVal ? val : currVal;
  } else {
    failureCriteriaValue[key] = val > currVal ? val : currVal;
  }
}
function getFailureCriteria(existingCriteriaIds: string[]) {
  var numberOfExistingCriteria = existingCriteriaIds.length;
  var index = 0;
  for (var key in failureCriteriaValue) {
    var splitted = key.split(" ");
    var criteriaId =
      index < numberOfExistingCriteria
        ? existingCriteriaIds[index++]
        : util.getUniqueId();
    failCriteria[criteriaId] = {
      clientMetric: splitted[0],
      aggregate: splitted[1],
      condition: splitted[2],
      action: splitted[3],
      value: failureCriteriaValue[key],
      requestName: splitted.length > 4 ? splitted.slice(4).join(" ") : null,
    };
  }
  for (; index < numberOfExistingCriteria; index++) {
    failCriteria[existingCriteriaIds[index]] = null;
  }
}
function getAutoStopCriteria(autoStopInput : autoStopCriteriaObjIn | string | null) {  
  if (autoStopInput == null) {autoStop = null; return;}
  if (typeof autoStopInput == "string") {
    if (autoStopInput == "disable") {
      let data = {
        autoStopDisabled : true,
        errorRate: 0,
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
}

function getMultiRegionLoadTestConfig(multiRegionalConfig : any[]) : regionConfiguration[]  {
  let parsedMultiRegionConfiguration : regionConfiguration[] = []
  multiRegionalConfig.forEach(regionConfig => {
      let data = {
          region: regionConfig.region,
          engineInstances: regionConfig.engineInstances,
      };
      parsedMultiRegionConfiguration.push(data);
  });
  return parsedMultiRegionConfiguration;
}
