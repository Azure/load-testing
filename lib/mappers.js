"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
exports.getTenantId = exports.getFileName = exports.getTestId = exports.getZipFiles = exports.getConfigFiles = exports.getPropertyFile = exports.getTestFile = exports.getYamlPath = exports.getTestKind = exports.getDefaultTestRunName = exports.getDefaultTestName = exports.getSubName = exports.getInputParams = exports.getResourceId = exports.getTestHeader = exports.getTestRunHeader = exports.startTestData = exports.dataPlaneHeader = exports.UploadAndValidateHeader = exports.uploadFileData = exports.createTestHeader = exports.createTestData = exports.TestKind = void 0;
const core = __importStar(require("@actions/core"));
const yaml = require("js-yaml");
const jwt_decode = require("jwt-decode");
const fs = __importStar(require("fs"));
var FormData = require("form-data");
const child_process_1 = require("child_process");
const util = __importStar(require("./util"));
const index = __importStar(require("./main"));
const util_1 = require("util");
const pathLib = require("path");
const { Readable } = require("stream");
var testId = "";
var displayName = "";
var testdesc = "SampleTest";
var engineInstances = "1";
var testPlan = "";
var propertyFile = null;
var configFiles = [];
var zipFiles = [];
var token = "";
var resourceId = "";
var subscriptionID = "";
var tenantId = "";
var YamlPath = "";
var passFailCriteria = [];
var autoStop = null;
var kvRefId = null;
var kvRefType = null;
var subnetId = null;
var splitCSVs = null;
var certificate = null;
let kind;
var TestKind;
(function (TestKind) {
    TestKind["URL"] = "URL";
    TestKind["JMX"] = "JMX"; // default
})(TestKind || (exports.TestKind = TestKind = {}));
var paramType;
(function (paramType) {
    paramType["env"] = "env";
    paramType["secrets"] = "secrets";
    paramType["cert"] = "cert";
})(paramType || (paramType = {}));
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
        testId: testId,
        description: testdesc,
        displayName: displayName,
        quickStartTest: false, // always quick test will be false because GH-actions doesnot support it now.
        loadTestConfiguration: {
            engineInstances: engineInstances,
            splitAllCSVs: splitCSVs,
            optionalLoadTestConfig: null
        },
        secrets: secretsYaml,
        testType: kind,
        kind: kind,
        certificate: certificate,
        environmentVariables: envYaml,
        passFailCriteria: {
            passFailMetrics: failCriteria,
        },
        autoStopCriteria: autoStop,
        subnetId: subnetId,
        keyvaultReferenceIdentityType: kvRefType,
        keyvaultReferenceIdentityId: kvRefId,
    };
    return data;
}
exports.createTestData = createTestData;
function createTestHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        let headers = {
            "content-type": "application/merge-patch+json",
            Authorization: "Bearer " + token,
        };
        return headers;
    });
}
exports.createTestHeader = createTestHeader;
function uploadFileData(filepath) {
    try {
        let filedata = fs.readFileSync(filepath);
        const readable = new Readable();
        readable._read = () => { };
        readable.push(filedata);
        readable.push(null);
        return readable;
    }
    catch (err) {
        err.message = "File not found " + filepath;
        throw new Error(err.message);
    }
}
exports.uploadFileData = uploadFileData;
function UploadAndValidateHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        let headers = {
            Authorization: "Bearer " + token,
            "content-type": "application/octet-stream",
        };
        return headers;
    });
}
exports.UploadAndValidateHeader = UploadAndValidateHeader;
function dataPlaneHeader() {
    let headers = {
        Authorization: "Bearer " + token,
    };
    return headers;
}
exports.dataPlaneHeader = dataPlaneHeader;
function startTestData(testRunName, runDisplayName, runDescription) {
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
exports.startTestData = startTestData;
function getTestRunHeader() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!isExpired()) {
            yield getAccessToken("https://loadtest.azure-dev.com");
        }
        let headers = {
            "content-type": "application/json",
            Authorization: "Bearer " + token,
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
            "content-type": "application/json",
            Authorization: "Bearer " + token,
        };
        return headers;
    });
}
exports.getTestHeader = getTestHeader;
function getResourceId() {
    const rg = core.getInput("resourceGroup");
    const ltres = core.getInput("loadTestResource");
    resourceId =
        "/subscriptions/" +
            subscriptionID +
            "/resourcegroups/" +
            rg +
            "/providers/microsoft.loadtestservice/loadtests/" +
            ltres;
    return resourceId;
}
exports.getResourceId = getResourceId;
function invalidName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    var r = new RegExp(/[^a-z0-9_-]+/);
    return r.test(value);
}
function invalidDisplayName(value) {
    if (value.length < 2 || value.length > 50)
        return true;
    return false;
}
function invalidDescription(value) {
    if (value.length > 100)
        return true;
    return false;
}
function getInputParams() {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        yield getAccessToken("https://management.core.windows.net");
        YamlPath = core.getInput("loadTestConfigFile");
        if (!(pathLib.extname(YamlPath) === ".yaml" ||
            pathLib.extname(YamlPath) === ".yml"))
            throw new Error("The Load Test configuration file should be of type .yaml or .yml");
        const config = yaml.load(fs.readFileSync(YamlPath, "utf8"));
        if ((0, util_1.isNullOrUndefined)(config.testName) && (0, util_1.isNullOrUndefined)(config.testId))
            throw new Error("The required field testId is missing in " + YamlPath + ".");
        if (!(0, util_1.isNullOrUndefined)(config.testName)) {
            testId = config.testName;
        }
        if (!(0, util_1.isNullOrUndefined)(config.testId)) {
            testId = config.testId;
        }
        if (typeof testId != "string") {
            throw new Error("TestId should be a string not a number.");
        }
        testId = testId.toLowerCase();
        displayName = testId;
        if (!(0, util_1.isNullOrUndefined)(config.displayName))
            displayName = config.displayName;
        if (invalidName(testId))
            throw new Error("Invalid testId. Allowed chararcters are [a-zA-Z0-9-_] and must be between 2 to 50 characters.");
        if (invalidDisplayName(displayName))
            throw new Error("Invalid display name. Display name must be between 2 to 50 characters.");
        testdesc = config.description;
        engineInstances = config.engineInstances;
        let path = pathLib.dirname(YamlPath);
        if ((0, util_1.isNullOrUndefined)(config.testPlan))
            throw new Error("The required field testPlan is missing in " + YamlPath + ".");
        testPlan = pathLib.join(path, config.testPlan);
        kind = (_a = config.testType) !== null && _a !== void 0 ? _a : TestKind.JMX;
        if (!isValidTestKind(kind)) {
            throw new Error("testType field given is invalid, valid testType are URL and JMX only.");
        }
        if (config.testType == TestKind.URL) {
            kind = TestKind.URL;
            if (!util.checkFileType(testPlan, 'json')) {
                throw new Error("A test plan of JSON file type is required for a URL test. Please upload a JSON file to run the test.");
            }
        }
        else if (!util.checkFileType(testPlan, 'jmx')) {
            throw new Error("A test plan of JMX file type is required for a JMX test. Please upload a JMX file to run the test.");
        }
        if (config.configurationFiles != null) {
            let tempconfigFiles = [];
            tempconfigFiles = config.configurationFiles;
            for (let file of tempconfigFiles) {
                if (kind == TestKind.URL && !util.checkFileType(file, 'csv')) {
                    throw new Error("Only CSV files are allowed as configuration files for a URL-based test.");
                }
                file = pathLib.join(path, file);
                configFiles.push(file);
            }
        }
        if (config.zipArtifacts != undefined) {
            let tempZipFiles = [];
            tempZipFiles = config.zipArtifacts;
            if (kind == TestKind.URL && tempZipFiles.length > 0) {
                throw new Error("Zip artifacts are not supported for the URL-based test.");
            }
            for (let file of tempZipFiles) {
                file = pathLib.join(path, file);
                zipFiles.push(file);
            }
            ;
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
        if (config.properties != undefined && config.properties.userPropertyFile != undefined) {
            if (!util.checkFileType(config.properties.userPropertyFile, 'properties')) {
                throw new Error("User property file with extension other than '.properties' is not permitted.");
            }
            if (kind == TestKind.URL) {
                throw new Error("User property file is not supported for the URL-based test.");
            }
            var propFile = config.properties.userPropertyFile;
            propertyFile = pathLib.join(path, propFile);
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
        getRunTimeParams();
        validateTestRunParams();
        if (testId === "" ||
            (0, util_1.isNullOrUndefined)(testId) ||
            testPlan === "" ||
            (0, util_1.isNullOrUndefined)(testPlan)) {
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
            const message = `An error occurred while getting credentials from ` +
                `Azure CLI: ${err.stack}`;
            throw new Error(message);
        }
    });
}
exports.getSubName = getSubName;
function isValidTestKind(value) {
    return Object.values(TestKind).includes(value);
}
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
            const message = `An error occurred while getting credentials from ` +
                `Azure CLI: ${err.stack}`;
            throw new Error(message);
        }
    });
}
function execAz(cmdArguments) {
    return __awaiter(this, void 0, void 0, function* () {
        const azCmd = process.platform === "win32" ? "az.cmd" : "az";
        return new Promise((resolve, reject) => {
            (0, child_process_1.execFile)(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8" }, (error, stdout) => {
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
    const a = new Date(Date.now()).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "Test_" + b[0] + "_" + c[1] + c[2];
}
exports.getDefaultTestName = getDefaultTestName;
function getDefaultTestRunName() {
    const a = new Date(Date.now()).toLocaleString();
    const b = a.split(", ");
    const c = a.split(" ");
    return "TestRun_" + b[0] + "_" + c[1] + c[2];
}
exports.getDefaultTestRunName = getDefaultTestRunName;
function getParameters(obj, type) {
    if (type == paramType.secrets) {
        for (var index in obj) {
            var val = obj[index];
            if (!validateUrl(val.value)) {
                throw new Error("Invalid secret URI");
            }
            secretsYaml[val.name] = { type: "AKV_SECRET_URI", value: val.value };
        }
    }
    else if (type == paramType.env) {
        for (var index in obj) {
            var val = obj[index];
            envYaml[val.name] = val.value;
        }
    }
    else if (type == paramType.cert) {
        for (var index in obj) {
            var val = obj[index];
            if (!validateUrl(val.value))
                throw new Error("Invalid certificate url");
            certificate = { name: val.name, type: "AKV_CERT_URI", value: val.value };
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
function getRunTimeParams() {
    var secretRun = core.getInput("secrets");
    if (secretRun != "") {
        try {
            var obj = JSON.parse(secretRun);
            for (var index in obj) {
                var val = obj[index];
                /*if(validateValue(val.value)) {
                            throw new Error("Invalid secret value");
                        }*/
                secretsRun[val.name] = { type: "SECRET_VALUE", value: val.value };
            }
        }
        catch (error) {
            throw new Error("Invalid secrets");
        }
    }
    var eRun = core.getInput("env");
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
function validateTestRunParams() {
    let runDisplayName = core.getInput("loadTestRunName");
    let runDescription = core.getInput("loadTestRunDescription");
    if (runDisplayName && invalidDisplayName(runDisplayName))
        throw new Error("Invalid test run name. Test run name must be between 2 to 50 characters.");
    if (runDescription && invalidDescription(runDescription))
        throw new Error("Invalid test run description. Test run description must be less than 100 characters.");
}
function getTestKind() {
    return kind;
}
exports.getTestKind = getTestKind;
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
function getZipFiles() {
    return zipFiles;
}
exports.getZipFiles = getZipFiles;
function getTestId() {
    return testId;
}
exports.getTestId = getTestId;
function getFileName(filepath) {
    var filename = pathLib.basename(filepath);
    return filename;
}
exports.getFileName = getFileName;
function getTenantId() {
    return tenantId;
}
exports.getTenantId = getTenantId;
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
        let tempStr = "";
        for (let i = 0; i < criteria.length; i++) {
            if (criteria[i] == "(") {
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if (criteria[i] == ")") {
                data.clientMetric = tempStr;
                tempStr = "";
            }
            else if (criteria[i] == ",") {
                data.condition = tempStr
                    .substring(0, util.indexOfFirstDigit(tempStr))
                    .trim();
                data.value = tempStr.substr(util.indexOfFirstDigit(tempStr)).trim();
                tempStr = "";
            }
            else {
                tempStr += criteria[i];
            }
        }
        if (criteria.indexOf(",") != -1) {
            data.action = tempStr.trim();
        }
        else {
            data.condition = tempStr
                .substring(0, util.indexOfFirstDigit(tempStr))
                .trim();
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
    var key = data.clientMetric +
        " " +
        data.aggregate +
        " " +
        data.condition +
        " " +
        data.action;
    if (data.requestName != "") {
        key = key + " " + data.requestName;
    }
    var val = parseInt(data.value);
    var currVal = val;
    if (failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if (data.condition == ">") {
        failureCriteriaValue[key] = val < currVal ? val : currVal;
    }
    else {
        failureCriteriaValue[key] = val > currVal ? val : currVal;
    }
}
function getFailureCriteria(existingCriteriaIds) {
    var numberOfExistingCriteria = existingCriteriaIds.length;
    var index = 0;
    for (var key in failureCriteriaValue) {
        var splitted = key.split(" ");
        var criteriaId = index < numberOfExistingCriteria
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
function getAutoStopCriteria(autoStopInput) {
    if (autoStopInput == null) {
        autoStop = null;
        return;
    }
    if (typeof autoStopInput == "string") {
        if (autoStopInput == "disable") {
            let data = {
                autoStopEnabled: false,
                autoStopDisabled: true,
                errorRate: 0,
                errorRateTimeWindow: 0,
                errorRateTimeWindowInSeconds: 60,
            };
            autoStop = data;
        }
        else {
            throw new Error("Invalid value, for disabling auto stop use 'autoStop: disable'");
        }
    }
    else {
        let data = {
            autoStopEnabled: true,
            autoStopDisabled: false,
            errorRate: autoStopInput.errorPercentage,
            errorRateTimeWindow: autoStopInput.timeWindow,
            errorRateTimeWindowInSeconds: autoStopInput.timeWindow,
        };
        autoStop = data;
    }
}
