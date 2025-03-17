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
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzurePublicCloud.cloudName,
            endpoints: {
                resourceManager: Constants.armEndpoint,
            }
        };
        let cloudShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["cloud", "show"]).resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters();
        
        expect(accountShowStub.calledOnce).toBe(true);
        expect(cloudShowStub.calledOnce).toBe(true);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.subscriptionName).toBe("fakeSubscriptionName");
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzurePublicCloud.cloudName);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.armTokenScope);
    });

    it("sets inputs for gov cloud", async () => {
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzureUSGovernmentCloud.cloudName,
            endpoints: {
                resourceManager: "https://management.usgovcloudapi.net/",
            }
        };
        let cloudShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["cloud", "show"]).resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters();
        
        expect(accountShowStub.calledOnce).toBe(true);
        expect(cloudShowStub.calledOnce).toBe(true);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.subscriptionName).toBe("fakeSubscriptionName");
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzureUSGovernmentCloud.cloudName);
        expect(taskParameters.armEndpoint).toBe("https://management.usgovcloudapi.net/");
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope);
    });

    it("sets inputs for gov cloud with different case", async () => {
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toUpperCase(),
            endpoints: {
                resourceManager: "https://management.usgovcloudapi.net/",
            }
        };
        let cloudShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["cloud", "show"]).resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters();
        
        expect(accountShowStub.calledOnce).toBe(true);
        expect(cloudShowStub.calledOnce).toBe(true);
        expect(taskParameters.resourceId.toLowerCase()).toBe(Constants.loadtestResourceId.toLowerCase());
        expect(taskParameters.subscriptionId).toBe(Constants.loadtestConfig.subscriptionId);
        expect(taskParameters.subscriptionName).toBe("fakeSubscriptionName");
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toUpperCase());
        expect(taskParameters.armEndpoint).toBe("https://management.usgovcloudapi.net/");
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope);
    });

    it("does not set resource id for postprocess", async () => {
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).resolves(accountShowResult);
        
        let cloudShowResult = {
            name: EnvironmentConstants.AzurePublicCloud.cloudName,
            endpoints: {
                resourceManager: Constants.armEndpoint,
            }
        };
        let cloudShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["cloud", "show"]).resolves(cloudShowResult);

        let taskParameters = await TaskParametersUtil.getTaskParameters(true);
        
        expect(accountShowStub.called).toBe(false);
        expect(cloudShowStub.calledOnce).toBe(true);
        expect(taskParameters.resourceId).toBe('');
        expect(taskParameters.subscriptionId).toBe('');
        expect(taskParameters.subscriptionName).toBe('');
        expect(taskParameters.environment).toBe(EnvironmentConstants.AzurePublicCloud.cloudName);
        expect(taskParameters.armEndpoint).toBe(Constants.armEndpoint);
        expect(taskParameters.dataPlaneTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope);
        expect(taskParameters.armTokenScope).toBe(EnvironmentConstants.AzurePublicCloud.armTokenScope);
    });

    it("az cli account show error throws error", async () => {
        let accountShowResult = {
            name: "fakeSubscriptionName",
            id: Constants.loadtestConfig.subscriptionId,
        };
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).resolves(accountShowResult);
        
        let cloudShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["cloud", "show"]).rejects("Error");
        
        expect(accountShowStub.calledOnce).toBe(true);
        expect(cloudShowStub.calledOnce).toBe(true);
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`Azure CLI for setting endPoint and scope`);
    });

    it("az cli cloud show error throws error", async () => {
        let accountShowStub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "show"]).rejects("Error");
        
        expect(accountShowStub.calledOnce).toBe(true);
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`Azure CLI for getting subscription name`);
    });

    it("missing resource group throws error", async () => {
        coreMock.setInput(InputConstants.resourceGroup, '');
        
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
    });

    it("missing load test resource throws error", async () => {
        coreMock.setInput(InputConstants.loadTestResource, '');
        
        expect(() => TaskParametersUtil.getTaskParameters()).toThrow(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
    });
})