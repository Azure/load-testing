import * as sinon from "sinon";
import { TestSupport } from "./Utils/TestSupport";
import { TaskLibMock } from "./Mocks/TaskLibMock";
import * as Constants from "./Constants/Constants";
import * as EnvironmentConstants from "../src/Constants/EnvironmentConstants";
import * as InputConstants from "../src/Constants/InputConstants";
import { TaskParametersUtil } from "../src/Utils/TaskParametersUtil";

describe('task parameters tests', () => {

    let taskLibMock: TaskLibMock;

    beforeEach(function () {
        taskLibMock = new TaskLibMock();
        TestSupport.setupTaskLibMockForTaskParameters(taskLibMock);
    });
  
    afterEach(function () {
        sinon.restore();
    });

    it("sets inputs for public cloud", async () => {
        let taskParameters = TaskParametersUtil.getTaskParameters();
        
        expect(taskParameters.serviceConnectionName).toBe(Constants.serviceConnectionName);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.authorizationScheme).toBe(Constants.authorizationScheme);
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzurePublicCloud.cloudName);
        expect(taskParameters.authorityHostUrl).toBe(Constants.authorityUrl);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.armTokenScope);
    });

    it("sets inputs for gov cloud", async () => {
        taskLibMock.setEndpointDataParameter(Constants.serviceConnectionName, InputConstants.serviceConnectionInputs.environment, EnvironmentConstants.AzureUSGovernmentCloud.cloudName);
        let taskParameters = TaskParametersUtil.getTaskParameters();
        
        expect(taskParameters.serviceConnectionName).toBe(Constants.serviceConnectionName);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzureUSGovernmentCloud.cloudName);
        expect(taskParameters.authorityHostUrl).toBe(Constants.authorityUrl);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope);
    });

    it("sets inputs for gov cloud with different case", async () => {
        taskLibMock.setEndpointDataParameter(Constants.serviceConnectionName, InputConstants.serviceConnectionInputs.environment, EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toUpperCase());
        let taskParameters = TaskParametersUtil.getTaskParameters();
        
        expect(taskParameters.serviceConnectionName).toBe(Constants.serviceConnectionName);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toUpperCase());
        expect(taskParameters.authorityHostUrl).toBe(Constants.authorityUrl);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope);
    });

    it("does not set resource id for postprocess", async () => {
        let taskParameters = TaskParametersUtil.getTaskParameters(true);
        
        expect(taskParameters.serviceConnectionName).toBe(Constants.serviceConnectionName);
        expect(taskParameters.resourceId).toBe('');
        expect(taskParameters.subscriptionId).toBe('');
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzurePublicCloud.cloudName);
        expect(taskParameters.authorityHostUrl).toBe(Constants.authorityUrl);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.armTokenScope);
    });

    it("missing service connection throws error", async () => {
        taskLibMock.setInput(InputConstants.serviceConnectionName, '');
        
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`The input field "azureSubscription" is empty. Provide an existing service connection`);
    });

    it("missing subscription throws error", async () => {
        taskLibMock.setEndpointDataParameter(Constants.serviceConnectionName, InputConstants.serviceConnectionInputs.subscriptionId, '');
        
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`The subscription assigned to the service connection is empty. Provide an proper service connection with an SPN assigned to it.`);
    });

    it("missing resource group throws error", async () => {
        taskLibMock.setInput(InputConstants.resourceGroup, '');
        
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
    });

    it("missing load test resource throws error", async () => {
        taskLibMock.setInput(InputConstants.loadTestResource, '');
        
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
    });
})