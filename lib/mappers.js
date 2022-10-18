"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantId = exports.getFileName = exports.getTestName = exports.getConfigFiles = exports.getPropertyFile = exports.getTestFile = exports.getYamlPath = exports.getDefaultTestRunName = exports.getDefaultTestName = exports.getSubName = exports.getInputParams = exports.getResourceId = exports.getTestHeader = exports.getTestRunHeader = exports.startTestData = exports.dataPlaneHeader = exports.UploadAndValidateHeader = exports.uploadFileData = exports.createTestHeader = exports.createTestData = void 0;
const core = __importStar(require("@actions/core"));
const yaml = require('js-yaml');
const jwt_decode = require('jwt-decode');
const fs = __importStar(require("fs"));
var FormData = require('form-data');
const child_process_1 = require("child_process");
const util = __importStar(require("./util"));
const index = __importStar(require("./main"));
var testName = '';
var testdesc = 'SampleTest';
var engineInstances = '1';
var testPlan = '';
var propertyFile = null;
var configFiles = [];
var token = '';
var resourceId = '';
var subscriptionID = '';
var tenantId = '';
var YamlPath = '';
var passFailCriteria = [];
var kvRefId = null;
var kvRefType = null;
var subnetId = null;
var splitCSVs = null;
var certificates = null;
;
;
;
let failCriteria = {};
let secretsYaml = {};
let secretsRun = {};
let envYaml = {};
let envRun = {};
let failureCriteriaValue = {};
function getExistingData() {
    var existingCriteria = index.getExistingCriteria();
    var existingCriteriaIds = Object.keys(existingCriteria);
    getFailureCriteria(existingCriteriaIds);
    var existingParams = index.getExistingParams();
    for (var key in existingParams) {
        if (!secretsYaml.hasOwnProperty(key))
            secretsYaml[key] = null;
    }
    var existingEnv = index.getExistingEnv();
    for (var key in existingEnv) {
        if (!envYaml.hasOwnProperty(key))
            envYaml[key] = null;
    }
}
function createTestData() {
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
        certificate: certificates,
        environmentVariables: envYaml,
        passFailCriteria: {
            passFailMetrics: failCriteria
        },
        subnetId: subnetId,
        keyvaultReferenceIdentityType: kvRefType,
        keyvaultReferenceIdentityId: kvRefId
    };
    return data;
}
exports.createTestData = createTestData;
function createTestHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        let headers = {
            'content-type': 'application/merge-patch+json',
            'Authorization': 'Bearer ' + token
        };
        return headers;
    });
}
exports.createTestHeader = createTestHeader;
function uploadFileData(filepath) {
    try {
        const formData = new FormData();
        let filedata = fs.readFileSync(filepath);
        var index = filepath.lastIndexOf('/');
        var filename = filepath.substring(index + 1);
        formData.append('file', filedata, filename);
        return formData;
    }
    catch (err) {
        err.message = "File not found " + filepath;
        throw new Error(err.message);
    }
}
exports.uploadFileData = uploadFileData;
function UploadAndValidateHeader(formData) {
    return __awaiter(this, void 0, void 0, function* () {
        let headers = {
            'Authorization': 'Bearer ' + token,
            'content-type': `multipart/form-data; boundary=${formData.getBoundary()}`
        };
        return headers;
    });
}
exports.UploadAndValidateHeader = UploadAndValidateHeader;
function dataPlaneHeader() {
    let headers = {
        'Authorization': 'Bearer ' + token
    };
    return headers;
}
exports.dataPlaneHeader = dataPlaneHeader;
function startTestData(testRunName) {
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
exports.startTestData = startTestData;
function getTestRunHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isExpired()) {
            yield getAccessToken("https://loadtest.azure-dev.com");
        }
        let headers = {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        return headers;
    });
}
exports.getTestRunHeader = getTestRunHeader;
function isExpired() {
    const header = jwt_decode(token);
    const now = Math.floor(Date.now() / 1000);
    return header && header.exp > now;
}
function getTestHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getAccessToken("https://loadtest.azure-dev.com");
        let headers = {
            'content-type': 'application/json',
            'Authorization': 'Bearer ' + token
        };
        return headers;
    });
}
exports.getTestHeader = getTestHeader;
function getResourceId() {
    const rg = core.getInput('resourceGroup');
    const ltres = core.getInput('loadTestResource');
    resourceId = "/subscriptions/" + subscriptionID + "/resourcegroups/" + rg + "/providers/microsoft.loadtestservice/loadtests/" + ltres;
    return resourceId;
}
exports.getResourceId = getResourceId;
function validateName(value) {
    var r = new RegExp(/[^a-zA-Z0-9_-]/);
    return r.test(value);
}
function getInputParams() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getAccessToken("https://management.core.windows.net");
        YamlPath = core.getInput('loadTestConfigFile');
        if (!(YamlPath.includes(".yaml") || YamlPath.includes(".yml")))
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
        if (config.testName == null || config.testName == undefined)
            throw new Error("The required field testName is missing in " + YamlPath + ".");
        testName = (config.testName).toLowerCase();
        if (validateName(testName))
            throw new Error("Invalid testName. Allowed chararcters are [a-zA-Z0-9-_]");
        testdesc = config.description;
        engineInstances = config.engineInstances;
        let path = YamlPath.substr(0, YamlPath.lastIndexOf('/') + 1);
        if (config.testPlan == null || config.testPlan == undefined)
            throw new Error("The required field testPlan is missing in " + YamlPath + ".");
        testPlan = path + config.testPlan;
        if (validateName(getFileName(config.testPlan))) {
            throw new Error("Invalid testPlan name. Allowed chararcters are [a-zA-Z0-9-_]");
        }
        if (config.configurationFiles != null) {
            var tempconfigFiles = [];
            tempconfigFiles = config.configurationFiles;
            tempconfigFiles.forEach(file => {
                if (validateName(getFileName(file)))
                    throw new Error("Invalid configuration filename. Allowed chararcters are [a-z0-9-_]");
                file = path + file;
                configFiles.push(file);
            });
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
        if (config.properties != undefined) {
            var propFile = config.properties.userPropertyFile;
            propertyFile = path + propFile;
        }
        if (config.secrets != undefined) {
            kvRefType = 'SystemAssigned';
            getParameters(config.secrets, "secrets");
        }
        if (config.env != undefined) {
            getParameters(config.env, "env");
        }
        if (config.certificates != undefined) {
            getParameters(config.certificates, "certificates");
        }
        if (config.keyVaultReferenceIdentity != undefined) {
            kvRefType = 'UserAssigned';
            kvRefId = config.keyVaultReferenceIdentity;
        }
        getRunTimeParams();
        if (testName === '' || testPlan === '') {
            throw new Error("The required fields testName/testPlan are missing in " + YamlPath + ".");
        }
    });
}
exports.getInputParams = getInputParams;
function getSubName() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cmdArguments = ["account", "show"];
            var result = yield execAz(cmdArguments);
            let name = result.name;
            return name;
        }
        catch (err) {
            const message = `An error occurred while getting credentials from ` + `Azure CLI: ${err.stack}`;
            throw new Error(message);
        }
    });
}
exports.getSubName = getSubName;
function getAccessToken(aud) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const cmdArguments = ["account", "get-access-token", "--resource"];
            cmdArguments.push(aud);
            var result = yield execAz(cmdArguments);
            token = result.accessToken;
            subscriptionID = result.subscription;
            tenantId = result.tenant;
            return token;
        }
        catch (err) {
            const message = `An error occurred while getting credentials from ` + `Azure CLI: ${err.stack}`;
            throw new Error(message);
        }
    });
}
function execAz(cmdArguments) {
    return __awaiter(this, void 0, void 0, function* () {
        const azCmd = process.platform === "win32" ? "az.cmd" : "az";
        return new Promise((resolve, reject) => {
            child_process_1.execFile(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8" }, (error, stdout) => {
                if (error) {
                    return reject(error);
                }
                try {
                    return resolve(JSON.parse(stdout));
                }
                catch (err) {
                    const msg = `An error occurred while parsing the output "${stdout}", of ` +
                        `the cmd az "${cmdArguments}": ${err.stack}.`;
                    return reject(new Error(msg));
                }
            });
        });
    });
}
function getDefaultTestName() {
    const a = (new Date(Date.now())).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "Test_" + b[0] + "_" + c[1] + c[2];
}
exports.getDefaultTestName = getDefaultTestName;
function getDefaultTestRunName() {
    const a = (new Date(Date.now())).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "TestRun_" + b[0] + "_" + c[1] + c[2];
}
exports.getDefaultTestRunName = getDefaultTestRunName;
function getParameters(obj, type) {
    if (type == "secrets") {
        for (var index in obj) {
            var val = obj[index];
            if (!validateUrl(val.value)) {
                throw new Error("Invalid secret URI");
            }
            secretsYaml[val.name] = { type: 'AKV_SECRET_URI', value: val.value };
        }
    }
    else if (type == "env") {
        for (var index in obj) {
            var val = obj[index];
            envYaml[val.name] = val.value;
        }
    }
    else if (type == "certificates") {
        for (var index in obj) {
            var val = obj[index];
            if (!validateUrl(val.value))
                throw new Error("Invalid certificate url");
            certificates = { name: val.name, type: 'AKV_CERT_URI', value: val.value };
            break;
        }
    }
}
function validateUrl(url) {
    //var r = new RegExp(/(http|https):\/\/.*\/secrets\/[/a-zA-Z0-9]+$/);
    var pattern = /https:\/\/+[a-zA-Z0-9_-]+\.+(?:vault|vault-int)+\.+(?:azure|azure-int|usgovcloudapi|microsoftazure)+\.+(?:net|cn|de)+\/+(?:secrets|certificates|keys|storage)+\/+[a-zA-Z0-9_-]+\/+|[a-zA-Z0-9]+$/;
    var r = new RegExp(pattern);
    return r.test(url);
}
function validateValue(value) {
    var r = new RegExp(/[^a-zA-Z0-9-_]/);
    return r.test(value);
}
function getRunTimeParams() {
    var secretRun = core.getInput('secrets');
    if (secretRun != "") {
        try {
            var obj = JSON.parse(secretRun);
            for (var index in obj) {
                var val = obj[index];
                /*if(validateValue(val.value)) {
                    throw new Error("Invalid secret value");
                }*/
                secretsRun[val.name] = { type: 'SECRET_VALUE', value: val.value };
            }
        }
        catch (error) {
            throw new Error("Invalid secrets");
        }
    }
    var eRun = core.getInput('env');
    if (eRun != "") {
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
function getYamlPath() {
    return YamlPath;
}
exports.getYamlPath = getYamlPath;
function getTestFile() {
    return testPlan;
}
exports.getTestFile = getTestFile;
function getPropertyFile() {
    return propertyFile;
}
exports.getPropertyFile = getPropertyFile;
function getConfigFiles() {
    return configFiles;
}
exports.getConfigFiles = getConfigFiles;
function getTestName() {
    return testName;
}
exports.getTestName = getTestName;
function getFileName(filepath) {
    var index = filepath.lastIndexOf('/');
    var filename = filepath.substring(index + 1);
    var extIndex = filename.indexOf('.');
    if (extIndex != -1)
        filename = filename.substring(0, extIndex);
    return filename.toLowerCase();
}
exports.getFileName = getFileName;
function getTenantId() {
    return tenantId;
}
exports.getTenantId = getTenantId;
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
        };
        if (typeof criteria !== "string") {
            var request = Object.keys(criteria)[0];
            data.requestName = request;
            criteria = criteria[request];
        }
        let tempStr = "";
        for (let i = 0; i < criteria.length; i++) {
            if (criteria[i] == '(') {
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if (criteria[i] == ')') {
                data.clientmetric = tempStr;
                tempStr = "";
            }
            else if (criteria[i] == ',') {
                data.condition = tempStr.substring(0, util.indexOfFirstDigit(tempStr)).trim();
                data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
                tempStr = "";
            }
            else {
                tempStr += criteria[i];
            }
        }
        if (criteria.indexOf(',') != -1) {
            data.action = tempStr.trim();
        }
        else {
            data.condition = tempStr.substring(0, util.indexOfFirstDigit(tempStr)).trim();
            data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
        }
        ValidateAndAddCriteria(data);
    });
}
function ValidateAndAddCriteria(data) {
    if (data.action == "")
        data.action = "continue";
    data.value = util.removeUnits(data.value);
    if (!util.validCriteria(data))
        throw new Error("Invalid Failure Criteria");
    var key = data.clientmetric + ' ' + data.aggregate + ' ' + data.condition + ' ' + data.action;
    if (data.requestName != "") {
        key = key + ' ' + data.requestName;
    }
    var val = parseInt(data.value);
    var currVal = val;
    if (failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if (data.condition == '>') {
        failureCriteriaValue[key] = (val < currVal) ? val : currVal;
    }
    else {
        failureCriteriaValue[key] = (val > currVal) ? val : currVal;
    }
}
function getFailureCriteria(existingCriteriaIds) {
    var numberOfExistingCriteria = existingCriteriaIds.length;
    var index = 0;
    for (var key in failureCriteriaValue) {
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
    for (; index < numberOfExistingCriteria; index++) {
        failCriteria[existingCriteriaIds[index]] = null;
    }
}
