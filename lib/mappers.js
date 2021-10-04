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
const child_process_1 = require("child_process");
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
    var index = filepath.lastIndexOf('/');
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
            yield getAccessToken();
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
function getResourceId() {
    const rg = core.getInput('resourceGroup');
    const ltres = core.getInput('loadtestResource');
    resourceId = "/subscriptions/" + subscriptionID + "/resourcegroups/" + rg + "/providers/microsoft.loadtestservice/loadtests/" + ltres;
    return resourceId;
}
exports.getResourceId = getResourceId;
function getInputParams() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield getAccessToken();
            YamlPath = core.getInput('YAMLFilePath');
            const config = yaml.load(fs.readFileSync(YamlPath, 'utf8'));
            testName = (config.testName).toLowerCase();
            testdesc = config.description;
            engineInstances = config.engineInstances;
            engineSize = config.engineSize;
            let path = YamlPath.substr(0, YamlPath.lastIndexOf('/') + 1);
            testPlan = path + config.testPlan;
            if (config.configurationFiles != null) {
                var tempconfigFiles = [];
                tempconfigFiles = config.configurationFiles;
                tempconfigFiles.forEach(file => {
                    file = path + file;
                    configFiles.push(file);
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
    });
}
exports.getInputParams = getInputParams;
function getAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let aud = "https://loadtest.azure-dev.com";
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
