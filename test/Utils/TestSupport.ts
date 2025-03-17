import * as Constants from "../Constants/Constants";
import { TaskLibMock } from "../Mocks/TaskLibMock";
import * as InputConstants from "../../src/Constants/InputConstants";
import * as EnvironmentConstants from "../../src/Constants/EnvironmentConstants";
import * as path from 'path';
import { TestModel } from "../../src/models/PayloadModels";
import { PostTaskParameters } from "../../src/models/UtilModels";
const yaml = require('js-yaml');
const fs = require('fs');

export class TestSupport {

    public static setupTaskLibMockForTaskParameters(taskLibMock: TaskLibMock) {
        taskLibMock.setInput(InputConstants.serviceConnectionName, Constants.serviceConnectionName);
        taskLibMock.setEndpointDataParameter(Constants.serviceConnectionName, InputConstants.serviceConnectionInputs.subscriptionId, Constants.loadtestConfig.subscriptionId);
        taskLibMock.setEndpointDataParameter(Constants.serviceConnectionName, InputConstants.serviceConnectionInputs.environment, EnvironmentConstants.AzurePublicCloud.cloudName);
        taskLibMock.setInput(InputConstants.resourceGroup, Constants.loadtestConfig.resourceGroup);
        taskLibMock.setInput(InputConstants.loadTestResource, Constants.loadtestConfig.resourceName);
        taskLibMock.setEndpointDataParameter(Constants.serviceConnectionName, InputConstants.serviceConnectionInputs.authorityUrl, Constants.authorityUrl);
        taskLibMock.setEndpointUrl(Constants.serviceConnectionName, Constants.armEndpoint);
        taskLibMock.setEndpointAuthorizationScheme(Constants.serviceConnectionName, Constants.authorizationScheme);
    }

    public static setupTaskLibMockForPostProcess(taskLibMock: TaskLibMock) {
        taskLibMock.setTaskVariable(PostTaskParameters.runId, 'runid');
        taskLibMock.setTaskVariable(PostTaskParameters.baseUri, Constants.loadtestConfig.dataPlaneUrl);
        taskLibMock.setTaskVariable(PostTaskParameters.isRunCompleted, 'false');
    }

    public static createAndSetLoadTestConfigFile(yamlJson: any, taskLibMock: TaskLibMock, fileName: string = "loadtestConfig.yaml") {
        let yamlStr = yaml.dump(yamlJson);

        const configFilesDirectory = './test/ConfigFiles';
        if (!fs.existsSync(configFilesDirectory)){
            fs.mkdirSync(configFilesDirectory);
        }

        let configFilePath = path.join(__dirname, "..", "..", "test", "ConfigFiles", fileName);
        fs.writeFileSync(configFilePath, yamlStr);

        taskLibMock.setInput(InputConstants.loadTestConfigFile, configFilePath);
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