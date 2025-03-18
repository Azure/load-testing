import * as sinon from "sinon";
import * as Constants from "../Constants/Constants";
import { CoreMock } from "../Mocks/CoreMock";
import * as InputConstants from "../../src/Constants/InputConstants";
import * as path from 'path';
import { TestModel } from "../../src/models/PayloadModels";
import { PostTaskParameters } from "../../src/models/UtilModels";
const yaml = require('js-yaml');
const fs = require('fs');

export class TestSupport {

    public static setupMockForTaskParameters(coreMock: CoreMock) {
        coreMock.setInput(InputConstants.resourceGroup, Constants.loadtestConfig.resourceGroup);
        coreMock.setInput(InputConstants.loadTestResource, Constants.loadtestConfig.resourceName);
    }

    public static setupMockForPostProcess() {
        sinon.stub(process.env, PostTaskParameters.runId).value('runid');
        sinon.stub(process.env, PostTaskParameters.baseUri).value(Constants.loadtestConfig.dataPlaneUrl);
        sinon.stub(process.env, PostTaskParameters.isRunCompleted).value('false');
    }

    public static createAndSetLoadTestConfigFile(yamlJson: any, coreMock: CoreMock, fileName: string = "loadtestConfig.yaml") {
        let yamlStr = yaml.dump(yamlJson);

        const configFilesDirectory = './test/ConfigFiles';
        if (!fs.existsSync(configFilesDirectory)){
            fs.mkdirSync(configFilesDirectory);
        }

        let configFilePath = path.join(__dirname, "..", "..", "test", "ConfigFiles", fileName);
        fs.writeFileSync(configFilePath, yamlStr);

        coreMock.setInput(InputConstants.loadTestConfigFile, configFilePath);
    }

    public static validateTestPayload(testPayload: TestModel, expectedTestPayload: TestModel) {
        expect(testPayload.testId).toBe(expectedTestPayload.testId);
        expect(testPayload.displayName).toBe(expectedTestPayload.displayName);
        expect(testPayload.description).toBe(expectedTestPayload.description);
        expect(testPayload.kind).toBe(expectedTestPayload.kind);

        if (expectedTestPayload.loadTestConfiguration) {
            expect(testPayload.loadTestConfiguration!.engineInstances).toBe(expectedTestPayload.loadTestConfiguration.engineInstances);
            expect(testPayload.loadTestConfiguration!.splitAllCSVs).toBe(expectedTestPayload.loadTestConfiguration.splitAllCSVs);
            expect(testPayload.loadTestConfiguration!.regionalLoadTestConfig).toEqual(expectedTestPayload.loadTestConfiguration.regionalLoadTestConfig);
        }
        
        expect(testPayload.autoStopCriteria).toEqual(expectedTestPayload.autoStopCriteria);

        if (expectedTestPayload.secrets) {
            expect(testPayload.secrets).toEqual(expectedTestPayload.secrets);
        }

        if (expectedTestPayload.certificate) {
            expect(testPayload.certificate).toEqual(expectedTestPayload.certificate);
        }

        if (expectedTestPayload.environmentVariables) {
            expect(testPayload.environmentVariables).toEqual(expectedTestPayload.environmentVariables);
        }

        if (expectedTestPayload.passFailCriteria) {
            expect(testPayload.passFailCriteria).toEqual(expectedTestPayload.passFailCriteria);
        }

        expect(testPayload.subnetId).toBe(expectedTestPayload.subnetId);
        expect(testPayload.publicIPDisabled).toBe(expectedTestPayload.publicIPDisabled);
        expect(testPayload.keyvaultReferenceIdentityType).toBe(expectedTestPayload.keyvaultReferenceIdentityType);
        expect(testPayload.keyvaultReferenceIdentityId).toBe(expectedTestPayload.keyvaultReferenceIdentityId);
        expect(testPayload.metricsReferenceIdentityType).toBe(expectedTestPayload.metricsReferenceIdentityType);
        expect(testPayload.metricsReferenceIdentityId).toBe(expectedTestPayload.metricsReferenceIdentityId);
        expect(testPayload.engineBuiltinIdentityType).toBe(expectedTestPayload.engineBuiltinIdentityType);
        expect(testPayload.engineBuiltinIdentityIds).toEqual(expectedTestPayload.engineBuiltinIdentityIds);
    }
}