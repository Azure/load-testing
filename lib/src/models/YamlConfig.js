"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.YamlConfig = void 0;
// The model of the YAML file that the user provides to the task
class YamlConfig {
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
exports.YamlConfig = YamlConfig;
