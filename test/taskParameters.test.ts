import * as sinon from "sinon";
import { TestSupport } from "./Utils/TestSupport";
import { CoreMock } from "./Mocks/CoreMock";
import * as Constants from "./Constants/Constants";
import * as EnvironmentConstants from "../src/Constants/EnvironmentConstants";
import * as InputConstants from "../src/Constants/InputConstants";
import { TaskParametersUtil } from "../src/Utils/TaskParametersUtil";
import * as AzCliUtility from "../src/Utils/AzCliUtility";

describe('task parameters tests', () => {

    let coreMock: CoreMock;

    beforeEach(function () {
        coreMock = new CoreMock();
        TestSupport.setupMockForTaskParameters(coreMock);
    });
  
    afterEach(function () {
        sinon.restore();
    });

    it("sets inputs for public cloud", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        stub.onFirstCall().resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzurePublicCloud.cloudName,
            endpoints: {
                resourceManager: Constants.armEndpoint,
            }
        };
        stub.onSecondCall().resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters();
        
        expect(stub.calledWith(["account", "show"])).toBe(true);
        expect(stub.calledWith(["cloud", "show"])).toBe(true);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.subscriptionName).toBe("fakeSubscriptionName");
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzurePublicCloud.cloudName);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.armTokenScope);
    });

    it("sets inputs for gov cloud", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        stub.onFirstCall().resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzureUSGovernmentCloud.cloudName,
            endpoints: {
                resourceManager: "https://management.usgovcloudapi.net/",
            }
        };
        stub.onSecondCall().resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters();
        
        expect(stub.calledWith(["account", "show"])).toBe(true);
        expect(stub.calledWith(["cloud", "show"])).toBe(true);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.subscriptionName).toBe("fakeSubscriptionName");
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzureUSGovernmentCloud.cloudName);
        expect(taskParameters.armEndpoint).toBe("https://management.usgovcloudapi.net/");
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope);
    });

    it("sets inputs for gov cloud with different case", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        stub.onFirstCall().resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toUpperCase(),
            endpoints: {
                resourceManager: "https://management.usgovcloudapi.net/",
            }
        };
        stub.onSecondCall().resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters();
        
        expect(stub.calledWith(["account", "show"])).toBe(true);
        expect(stub.calledWith(["cloud", "show"])).toBe(true);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.subscriptionName).toBe("fakeSubscriptionName");
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toUpperCase());
        expect(taskParameters.armEndpoint).toBe("https://management.usgovcloudapi.net/");
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope);
    });

    it("does not set resource id for postprocess", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let cloudShowResult = {
            name: EnvironmentConstants.AzurePublicCloud.cloudName,
            endpoints: {
                resourceManager: Constants.armEndpoint,
            }
        };
        // account show is not called so 1st call is cloud show
        stub.onFirstCall().resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters(true);
        
        expect(stub.calledWith(["account", "show"])).toBe(false);
        expect(stub.calledWith(["cloud", "show"])).toBe(true);
        expect(taskParameters.resourceId).toBe('');
        expect(taskParameters.subscriptionId).toBe('');
        expect(taskParameters.subscriptionName).toBe('');
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzurePublicCloud.cloudName);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.armTokenScope);
    });

    it("az cli cloud show error throws error", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        stub.onFirstCall().resolves(accountShowResult);
        
        stub.onSecondCall().rejects(new Error("Error"));
        
        expect(async () => await TaskParametersUtil.getTaskParameters()).rejects.toThrow(`Azure CLI for setting endPoint and scope`);
    });

    it("az cli account show error throws error", async () => {
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).rejects(new Error("Error"));
        
        expect(async () => await TaskParametersUtil.getTaskParameters()).rejects.toThrow(`Azure CLI for getting subscription name`);
        expect(accountShowStub.calledOnce).toBe(true);
    });

    it("missing resource group throws error", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        stub.onFirstCall().resolves(accountShowResult);
        coreMock.setInput(InputConstants.resourceGroup, '');
        
        expect(async () => await TaskParametersUtil.getTaskParameters()).rejects.toThrow(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
    });

    it("missing load test resource throws error", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        stub.onFirstCall().resolves(accountShowResult);
        coreMock.setInput(InputConstants.loadTestResource, '');
        
        expect(async () => await TaskParametersUtil.getTaskParameters()).rejects.toThrow(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
    });
})