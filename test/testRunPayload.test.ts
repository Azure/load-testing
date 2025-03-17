import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { TestSupport } from "./Utils/TestSupport";
import { CoreMock } from "./Mocks/CoreMock";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import * as testYamls from './Constants/testYamls';
import { CreateAndRunTest } from "../src/RunnerFiles/CreateAndRunTest";
import { DataPlaneAPIMock } from "./Mocks/DataPlaneAPIMock";
import * as InputConstants from "../src/Constants/InputConstants";

describe('test run payload tests', () => {

    let coreMock: CoreMock;
    let authenticatorServiceMock: AuthenticatorServiceMock;
    let runner: CreateAndRunTest;

    beforeEach(function () {
        coreMock = new CoreMock();
        authenticatorServiceMock = new AuthenticatorServiceMock();
        authenticatorServiceMock.setupMock();

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let apiService = new APIService(authenticatorService);
        apiService.setBaseURL(Constants.loadtestConfig.dataPlaneUrlWithoutProtocol);
        runner = new CreateAndRunTest(apiService);
    });
  
    afterEach(function () {
        nock.cleanAll();
        sinon.restore();
    });

    it("without run time params", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxBasicYaml, coreMock, "testRunLoadtestConfig.yaml");

        let testId = testYamls.jmxBasicYaml.testId.toLowerCase()!;
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 404);

        await runner.initialize();
        let testRunPayload = await runner.getTestRunPayload();

        expect(testRunPayload).toBeDefined();
        expect(testRunPayload).not.toBeNull();
        expect(testRunPayload.displayName).toBeDefined();
        expect(testRunPayload.displayName).not.toBeNull();
        expect(testRunPayload.description).toBeDefined();
        expect(testRunPayload.description).not.toBeNull();
        expect(testRunPayload.testRunId).toBeDefined();
        expect(testRunPayload.testRunId).not.toBeNull();
        expect(testRunPayload.testId).toEqual(testId);
        expect(testRunPayload.environmentVariables).toEqual({});
        expect(testRunPayload.secrets).toEqual({});
    });

    it("with run time params", async () => {
        let secrets =  [
            {
            "name": "secret1",
            "value": "abc"
            }
        ];

        let env =  [
            {
            "name": "env1",
            "value": "abc"
            }
        ];

        let expectedSecrets = { secret1: { type: 'SECRET_VALUE', value: 'abc' } };
        let expectedEnv = { env1: 'abc' };
        
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxBasicYaml, coreMock);

        coreMock.setInput(InputConstants.testRunName, 'runtimename');
        coreMock.setInput(InputConstants.runDescription, 'Run Time Description');
        coreMock.setInput(InputConstants.secrets, JSON.stringify(secrets));
        coreMock.setInput(InputConstants.envVars, JSON.stringify(env));

        let testId = testYamls.jmxBasicYaml.testId.toLowerCase()!;
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 404);

        await runner.initialize();
        let testRunPayload = await runner.getTestRunPayload();

        expect(testRunPayload).toBeDefined();
        expect(testRunPayload).not.toBeNull();
        expect(testRunPayload.displayName).toEqual('runtimename');
        expect(testRunPayload.description).toEqual('Run Time Description');
        expect(testRunPayload.testRunId).toBeDefined();
        expect(testRunPayload.testRunId).not.toBeNull();
        expect(testRunPayload.testId).toEqual(testId);
        expect(testRunPayload.environmentVariables).toEqual(expectedEnv);
        expect(testRunPayload.secrets).toEqual(expectedSecrets);
    });

    it("incorrect env vars", async () => {

        let env =  {
            "name": "env1",
            "value": "abc"
        };
        
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxBasicYaml, coreMock, "testRunLoadtestConfig.yaml");

        coreMock.setInput(InputConstants.envVars, JSON.stringify(env));

        let testId = testYamls.jmxBasicYaml.testId.toLowerCase()!;
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 404);

        await runner.initialize();
        await expect(runner.getTestRunPayload()).rejects.toThrow(`Invalid`);
    });

    it("incorrect secrets", async () => {

        let secrets =  {
            "name": "secret1",
            "value": "abc"
        };
        
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxBasicYaml, coreMock, "testRunLoadtestConfig.yaml");

        coreMock.setInput(InputConstants.secrets, JSON.stringify(secrets));

        let testId = testYamls.jmxBasicYaml.testId.toLowerCase()!;
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 404);

        await runner.initialize();
        await expect(runner.getTestRunPayload()).rejects.toThrow(`Invalid`);
    });

})