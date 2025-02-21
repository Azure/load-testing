"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputVariableName = exports.APIRoute = exports.autoStopDisable = exports.testmanagerApiVersion = exports.OverRideParametersModel = exports.overRideParamsJSON = exports.DefaultYamlModel = void 0;
class DefaultYamlModel {
    constructor() {
        this.version = '';
        this.testId = '';
        this.testName = '';
        this.displayName = '';
        this.description = '';
        this.testPlan = '';
        this.testType = '';
        this.engineInstances = 0;
        this.subnetId = '';
        this.publicIPDisabled = false;
        this.configurationFiles = [];
        this.zipArtifacts = [];
        this.splitAllCSVs = false;
        this.properties = { userPropertyFile: '' };
        this.env = [];
        this.certificates = [];
        this.secrets = [];
        this.failureCriteria = [];
        this.appComponents = [];
        this.autoStop = { errorPercentage: 0, timeWindow: 0 };
        this.keyVaultReferenceIdentity = '';
        this.keyVaultReferenceIdentityType = '';
        this.regionalLoadTestConfig = [];
        this.referenceIdentities = [];
    }
}
exports.DefaultYamlModel = DefaultYamlModel;
exports.overRideParamsJSON = {
    testId: 'SampleTest',
    displayName: 'SampleTest',
    description: 'Load test website home page',
    engineInstances: 1,
    autoStop: { errorPercentage: 80, timeWindow: 60 },
};
class OverRideParametersModel {
    constructor() {
        this.testId = '';
        this.displayName = '';
        this.description = '';
        this.engineInstances = 0;
        this.autoStop = { errorPercentage: 0, timeWindow: 0 };
    }
}
exports.OverRideParametersModel = OverRideParametersModel;
exports.testmanagerApiVersion = "2024-07-01-preview";
exports.autoStopDisable = "disable";
var BaseAPIRoute;
(function (BaseAPIRoute) {
    BaseAPIRoute.featureFlag = "featureFlags";
})(BaseAPIRoute || (BaseAPIRoute = {}));
var APIRoute;
(function (APIRoute) {
    const latestVersion = "api-version=" + exports.testmanagerApiVersion;
    APIRoute.FeatureFlags = (flag) => `${BaseAPIRoute.featureFlag}/${flag}?${latestVersion}`;
})(APIRoute = exports.APIRoute || (exports.APIRoute = {}));
exports.OutputVariableName = 'ALTOutputVar';
