import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { TaskLibMock } from "./Mocks/TaskLibMock";
import * as Constants from "./Constants/Constants";
import * as EnvironmentConstants from "../src/Constants/EnvironmentConstants";
import * as InputConstants from "../src/Constants/InputConstants";
import { TaskParameters } from "../src/models/TaskParameters";
import * as azCliUtility from 'azure-pipelines-tasks-azure-arm-rest/azCliUtility';
import { FetchCallType } from "../src/models/UtilModels";
import { AuthenticationContext } from "adal-node";
import * as AzCliUtility from "../src/Utils/AzCliUtility";

describe('authenticator service tests', () => {

    let taskLibMock: TaskLibMock;
    let spnTaskParameters: TaskParameters = {
        subscriptionId: Constants.loadtestConfig.subscriptionId,
        environment: EnvironmentConstants.AzurePublicCloud.cloudName,
        armTokenScope: EnvironmentConstants.AzurePublicCloud.armTokenScope,
        dataPlaneTokenScope: EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope,
        resourceId: Constants.loadtestResourceId,
        serviceConnectionName: Constants.serviceConnectionName,
        authorizationScheme: "serviceprincipal",
        armEndpoint: Constants.armEndpoint,
        authorityHostUrl: Constants.authorityUrl,
    };

    beforeEach(function () {
        taskLibMock = new TaskLibMock();
    });
  
    afterEach(function () {
        sinon.restore();
    });

    it("service principal key based auth", async () => {
        let stub = sinon.stub(azCliUtility, "loginAzureRM");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, "fakeAuthType");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalKey, "fakeServicePrincipalKey");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        await authenticatorService.authorize();
        
        expect(taskLibMock.getEndpointAuthorizationParameterCalledWith(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalKey, false)).toBe(true);
        expect(taskLibMock.debugCalledWith("key based endpoint")).toBe(true);
        expect(stub.calledWith(spnTaskParameters.serviceConnectionName)).toBe(false);
    });

    it("service principal certificate based auth", async () => {
        let stub = sinon.stub(azCliUtility, "loginAzureRM");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, "SpnCertificate");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalCertificate, "fakeServicePrincipalCertificate");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        await authenticatorService.authorize();
        
        expect(taskLibMock.getEndpointAuthorizationParameterCalledWith(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalCertificate, false)).toBe(true);
        expect(taskLibMock.debugCalledWith("certificate based endpoint")).toBe(true);
        expect(stub.calledWith(spnTaskParameters.serviceConnectionName)).toBe(false);
    });

    it("non service principal auth calls loginAzureRM", async () => {
        let stub = sinon.stub(azCliUtility, "loginAzureRM");
        
        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        await authenticatorService.authorize();
        
        expect(stub.calledWith(Constants.defaultTaskParameters.serviceConnectionName)).toBe(true);
        expect(taskLibMock.debugCalledWith(`az cloud set --name ${Constants.defaultTaskParameters.environment}`)).toBe(false);
        expect(taskLibMock.execSyncCalledWith('az', ['cloud', 'set', '--name', Constants.defaultTaskParameters.environment])).toBe(false);
    });

    it("gov cloud calls az cloud set", async () => {
        let stub = sinon.stub(azCliUtility, "loginAzureRM");
        let taskParameters: TaskParameters = {
            subscriptionId: Constants.loadtestConfig.subscriptionId,
            environment: EnvironmentConstants.AzureUSGovernmentCloud.cloudName,
            armTokenScope: EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope,
            dataPlaneTokenScope: EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope,
            resourceId: Constants.loadtestResourceId,
            serviceConnectionName: Constants.serviceConnectionName,
            authorizationScheme: Constants.authorizationScheme,
            armEndpoint: Constants.armEndpoint,
            authorityHostUrl: Constants.authorityUrl,
        };
        
        let authenticatorService = new AuthenticatorService(taskParameters);
        await authenticatorService.authorize();
        
        expect(stub.calledWith(taskParameters.serviceConnectionName)).toBe(true);
        expect(taskLibMock.debugCalledWith(`az cloud set --name ${taskParameters.environment}`)).toBe(true);
        expect(taskLibMock.execSyncCalledWith('az', ['cloud', 'set', '--name', taskParameters.environment])).toBe(true);
    });

    it("getDataPlaneHeader non service principal auth calls az cli", async () => {
        let tokenResult = {
            accessToken: "token"
        };
        let stub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.dataPlaneTokenScope]).resolves(tokenResult);

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let result = await authenticatorService.getDataPlaneHeader(FetchCallType.get);
        
        expect(stub.calledWith(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.dataPlaneTokenScope])).toBe(true);
        expect(result).toHaveProperty("Authorization");
    });

    it("getDataPlaneHeader service principal auth calls auth context", async () => {
        let stub = sinon.stub(AuthenticationContext.prototype, "acquireTokenWithClientCredentials").yields(null, "token");

        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, "fakeAuthType");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalKey, "fakeServicePrincipalKey");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        let result = await authenticatorService.getDataPlaneHeader(FetchCallType.get);
        
        expect(taskLibMock.execSyncCalledWith('az', ["account", "get-access-token", "--resource", Constants.defaultTaskParameters.dataPlaneTokenScope])).toBe(false);
        expect(result).toHaveProperty("Authorization");
        expect(stub.calledWith(spnTaskParameters.dataPlaneTokenScope, "fakeClientId", "fakeServicePrincipalKey")).toBe(true);
    });

    it("getARMTokenHeader non service principal auth calls az cli", async () => {
        let tokenResult = {
            accessToken: "token"
        };
        let stub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.armTokenScope]).resolves(tokenResult);

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let result = await authenticatorService.getARMTokenHeader();
        
        expect(stub.calledWith(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.armTokenScope])).toBe(true);
        expect(result).toHaveProperty("Authorization");
    });

    it("getARMTokenHeader service principal auth calls auth context", async () => {
        let stub = sinon.stub(AuthenticationContext.prototype, "acquireTokenWithClientCredentials").yields(null, "token");

        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, "fakeAuthType");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalKey, "fakeServicePrincipalKey");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        let result = await authenticatorService.getARMTokenHeader();
        
        expect(taskLibMock.execSyncCalledWith('az', ["account", "get-access-token", "--resource", Constants.defaultTaskParameters.dataPlaneTokenScope])).toBe(false);
        expect(result).toHaveProperty("Authorization");
        expect(stub.calledWith(spnTaskParameters.armTokenScope, "fakeClientId", "fakeServicePrincipalKey")).toBe(true);
    });

    it("service principal with empty client id throws error", async () => {
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        expect(async () => await authenticatorService.authorize()).rejects.toThrow("Invalid service connection");
    });

    it("service principal with empty tenant id throws error", async () => {
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        expect(async () => await authenticatorService.authorize()).rejects.toThrow("Invalid service connection");
    });

    it("service principal with empty key throws error", async () => {
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, "fakeAuthType");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalKey, "");
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        expect(async () => await authenticatorService.authorize()).rejects.toThrow("Invalid service connection. Client key is empty.");
    });

    it("service principal with null certificate throws error", async () => {
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, "SpnCertificate");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, "fakeClientId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, "fakeTenantId");
        taskLibMock.setEndpointAuthorizationParameter(spnTaskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalCertificate, undefined);
        
        let authenticatorService = new AuthenticatorService(spnTaskParameters);
        expect(async () => await authenticatorService.authorize()).rejects.toThrow("ClientKey/spnCertificate is invalid");
    });
})