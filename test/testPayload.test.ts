import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { TestSupport } from "./Utils/TestSupport";
import { TaskLibMock } from "./Mocks/TaskLibMock";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import * as testYamls from './Constants/testYamls';
import * as ReferenceIdentityYamls from './Constants/ReferenceIdentityYamls';
import * as FailureCriteriaYamls from './Constants/FailureCriteriaYamls';
import { CreateAndRunTest } from "../src/RunnerFiles/CreateAndRunTest";
import { DataPlaneAPIMock } from "./Mocks/DataPlaneAPIMock";
import * as TestPayloadConstants from "./Constants/TestPayloadConstants";
import * as InputConstants from "../src/Constants/InputConstants";

describe('test payload tests', () => {

    let taskLibMock: TaskLibMock;
    let authenticatorServiceMock: AuthenticatorServiceMock;
    let runner: CreateAndRunTest;

    beforeEach(function () {
        taskLibMock = new TaskLibMock();
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

    it("create basic jmx test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxBasicYaml, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testYamls.jmxBasicYaml.testId.toLowerCase()!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createBasicJmxTestExpectedPayload); 
    });

    it("create comprehensive jmx test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testYamls.jmxComprehensiveYaml.testId.toLowerCase()!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createJmxTestExpectedPayload); 
    });

    it("edit comprehensive jmx test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testYamls.jmxComprehensiveYaml.testId.toLowerCase()!, 200, TestPayloadConstants.editJmxTestResponse);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.editJmxTestExpectedPayload); 
    });

    it("override params comprehensive jmx test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, taskLibMock);
        taskLibMock.setInput(InputConstants.overRideParameters, JSON.stringify(TestPayloadConstants.overrideParams));

        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(TestPayloadConstants.overrideParams.testId!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createOverrideParamsJmxTestExpectedPayload); 
    });

    it("create url test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.urlYaml, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testYamls.urlYaml.testId.toLowerCase()!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createUrlTestExpectedPayload); 
    });

    it("create locust test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.locustYaml, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testYamls.locustYaml.testId.toLowerCase()!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createLocustTestExpectedPayload); 
    });

    it("create public ip disabled test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.subnetIdPIPDisabledTrue, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testYamls.subnetIdPIPDisabledTrue.testId.toLowerCase()!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createPublicIPDisabledTestExpectedPayload); 
    });

    it("create reference identities test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(ReferenceIdentityYamls.referenceIdentitiesBasicYaml, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(ReferenceIdentityYamls.referenceIdentitiesBasicYaml.testId.toLowerCase()!, 404);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.createReferenceIdentitiesTestExpectedPayload); 
    });

    it("create pf server criteria test", async () => {
        TestSupport.createAndSetLoadTestConfigFile(FailureCriteriaYamls.ClientAndServerPFDefaultMetrics, taskLibMock);
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(FailureCriteriaYamls.ClientAndServerPFDefaultMetrics.testId.toLowerCase()!, 200, TestPayloadConstants.editPFServerCriteriaTestResponse);

        await runner.initialize();
        let testPayload = await runner.getTestPayload();

        TestSupport.validateTestPayload(testPayload, TestPayloadConstants.editPFServerCriteriaTestExpectedPayload); 
    });
})