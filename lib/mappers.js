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
exports.getTenantId = exports.getFileName = exports.getTestName = exports.getConfigFiles = exports.getTestFile = exports.getYamlPath = exports.getInputParams = exports.getResourceId = exports.getTestRunHeader = exports.startTestData = exports.UploadAndValidateHeader = exports.uploadFileData = exports.createTestHeader = exports.createTestData = void 0;
const core = __importStar(require("@actions/core"));
const yaml = require('js-yaml');
const jwt_decode = require('jwt-decode');
const fs = __importStar(require("fs"));
var FormData = require('form-data');
var AuthenticationContext = require('adal-node').AuthenticationContext;
var testName = '';
var testdesc = 'SampleTest';
var engineSize = 's';
var engineInstances = '1';
var testPlan = '';
var configFiles = [];
var token = '';
var resourceId = '';
var subscriptionID = '';
var tenantId = '';
var clientId = '';
var clientkey = '';
var YamlPath = '';
function createTestData() {
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
exports.createTestData = createTestData;
function createTestHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        if (token == '') {
            var tokenRes = yield getTokenAPI();
            token = tokenRes.accessToken;
        }
        let headers = {
            'content-type': 'application/merge-patch+json',
            'Authorization': 'Bearer ' + token
        };
        return headers;
    });
}
exports.createTestHeader = createTestHeader;
function uploadFileData(filepath) {
    const formData = new FormData();
    let filedata = fs.readFileSync(filepath);
    var index = filepath.lastIndexOf('//');
    var filename = filepath.substring(index + 1);
    formData.append('file', filedata, filename);
    return formData;
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
function startTestData(testRunName) {
    var data = {
        testRunId: testRunName,
        displayName: testRunName,
        testId: testName,
        resourceId: resourceId,
        description: "Sample testRun"
    };
    return data;
}
exports.startTestData = startTestData;
function getTestRunHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isExpired()) {
            var tokenRes = yield getTokenAPI();
            token = tokenRes.accessToken;
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
    return __awaiter(this, void 0, void 0, function* () {
        const header = jwt_decode(token);
        const now = Math.floor(Date.now() / 1000);
        return header && header.exp > now;
    });
}
function getTokenAPI() {
    return __awaiter(this, void 0, void 0, function* () {
        var authorityHostUrl = 'https://login.windows.net';
        var authorityUrl = authorityHostUrl + '/' + tenantId;
        var resource = 'https://loadtest.azure-dev.com';
        var context = new AuthenticationContext(authorityUrl);
        return new Promise((resolve, reject) => {
            context.acquireTokenWithClientCredentials(resource, clientId, clientkey, (err, token) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(token);
                }
            });
        });
    });
}
function getResourceId() {
    const rg = core.getInput('resourceGroup');
    const ltres = core.getInput('loadtestResource');
    resourceId = "/subscriptions/" + subscriptionID + "/resourcegroups/" + rg + "/providers/microsoft.loadtestservice/loadtests/" + ltres;
    return resourceId;
}
exports.getResourceId = getResourceId;
function getInputParams() {
    try {
        getAuthInputs();
        YamlPath = core.getInput('YAMLFilePath');
        const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
        testName = (config.testName).toLowerCase();
        testdesc = config.description;
        engineInstances = config.engineInstances;
        engineSize = config.engineSize;
        let path = YamlPath.substr(0, YamlPath.indexOf('//') + 1);
        testPlan = path + config.testPlan;
        if (config.configurationFiles != null) {
            configFiles = config.configurationFiles;
            configFiles.forEach(file => {
                file = path + file;
            });
        }
        if (testName === '' || testPlan === '') {
            throw "Missing required fields ";
        }
    }
    catch (e) {
        e.message = "Missing required fields ";
        throw e;
    }
}
exports.getInputParams = getInputParams;
function getAuthInputs() {
    return __awaiter(this, void 0, void 0, function* () {
        var credentials = core.getInput('azuresubscription');
        let credsObject;
        try {
            credsObject = JSON.parse(credentials);
        }
        catch (ex) {
            throw new Error("Credentials object is not a valid JSON");
        }
        clientId = credsObject["clientId"];
        clientkey = credsObject["clientSecret"];
        tenantId = credsObject["tenantId"];
        subscriptionID = credsObject["subscriptionId"];
        if (clientId == '' || clientkey == '' || tenantId == '' || subscriptionID == '')
            throw new Error("Not all values are present in the creds object. Ensure clientId, clientSecret, tenantId and subscriptionID are supplied in the provided object");
    });
}
function getYamlPath() {
    return YamlPath;
}
exports.getYamlPath = getYamlPath;
function getTestFile() {
    return testPlan;
}
exports.getTestFile = getTestFile;
function getConfigFiles() {
    return configFiles;
}
exports.getConfigFiles = getConfigFiles;
function getTestName() {
    return testName;
}
exports.getTestName = getTestName;
function getFileName(filepath) {
    var index = filepath.lastIndexOf('//');
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
