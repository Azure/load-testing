import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import * as ServerMetricConfigPayloadConstants from './Constants/ServerMetricConfigPayloadConstants';
import * as AppComponentsPayloadConstants from './Constants/AppComponentsPayloadConstants';
import { DataPlaneAPIMock } from "./Mocks/DataPlaneAPIMock";
import * as TestRunResponseConstants from "./Constants/TestRunResponseConstants";

describe('api service tests', () => {

    let authenticatorServiceMock: AuthenticatorServiceMock;
    let apiService: APIService;

    beforeEach(function () {
        authenticatorServiceMock = new AuthenticatorServiceMock();
        authenticatorServiceMock.setupMock();

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        apiService = new APIService(authenticatorService);
        apiService.setBaseURL(Constants.loadtestConfig.dataPlaneUrlWithoutProtocol);
    });
  
    afterEach(function () {
        nock.cleanAll();
        sinon.restore();
    });

    it("get test api returns test on 200", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 200, Constants.testModel);

        apiService.setTestId(testId);
        let result = await apiService.getTestAPI(true);

        expect(result).toEqual(Constants.testModel);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("get test api returns null on 404", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 404);

        apiService.setTestId(testId);
        let result = await apiService.getTestAPI(true);

        expect(result).toBeNull();
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("get test api throws error on 404 if false", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 404);

        apiService.setTestId(testId);
        await expect(apiService.getTestAPI(false)).rejects.toThrow();
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("get test api throws error on error code", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(testId, 400);

        apiService.setTestId(testId);
        await expect(apiService.getTestAPI(false)).rejects.toThrow();
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("getAppComponents returns resp on success", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTestAppComponents(testId, 200, AppComponentsPayloadConstants.createAppComponentsExpectedPayload);

        apiService.setTestId(testId);
        let result = await apiService.getAppComponents();

        expect(result).toEqual(AppComponentsPayloadConstants.createAppComponentsExpectedPayload);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("getAppComponents returns null on error", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTestAppComponents(testId, 400);

        apiService.setTestId(testId);
        let result = await apiService.getAppComponents();

        expect(result).toBeNull();
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("getServerMetricsConfig returns resp on success", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTestServerMetricConfigs(testId, 200, ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);

        apiService.setTestId(testId);
        let result = await apiService.getServerMetricsConfig();

        expect(result).toEqual(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("getServerMetricsConfig returns null on error", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTestServerMetricConfigs(testId, 400);

        apiService.setTestId(testId);
        let result = await apiService.getServerMetricsConfig();

        expect(result).toBeNull();
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("deleteFileAPI does not throw error on success", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockDeleteFile(testId, "samplefile.jmx", 204);

        apiService.setTestId(testId);
        await apiService.deleteFileAPI("samplefile.jmx");
    });

    it("deleteFileAPI throws error on failure", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockDeleteFile(testId, "samplefile.jmx", 500);

        apiService.setTestId(testId);
        await expect(apiService.deleteFileAPI("samplefile.jmx")).rejects.toThrow();
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });
    
    it("createTestAPI returns resp on 201", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockCreateTest(testId, 201, Constants.testModel);

        apiService.setTestId(testId);
        let result = await apiService.createTestAPI(Constants.testModel);

        expect(result).toEqual(Constants.testModel);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("createTestAPI returns resp on 200", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockCreateTest(testId, 200, Constants.testModel);

        apiService.setTestId(testId);
        let result = await apiService.createTestAPI(Constants.testModel);

        expect(result).toEqual(Constants.testModel);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("createTestAPI throws error on failure", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockCreateTest(testId, 401);

        apiService.setTestId(testId);
        await expect(apiService.createTestAPI(Constants.testModel)).rejects.toThrow("Error in creating test");
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("patchAppComponents returns resp on 201", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockPatchTestAppComponents(testId, 201, Constants.appComponentsModel);

        apiService.setTestId(testId);
        let result = await apiService.patchAppComponents(Constants.appComponentsModel);

        expect(result).toEqual(Constants.appComponentsModel);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("patchAppComponents returns resp on 200", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockPatchTestAppComponents(testId, 200, Constants.appComponentsModel);

        apiService.setTestId(testId);
        let result = await apiService.patchAppComponents(Constants.appComponentsModel);

        expect(result).toEqual(Constants.appComponentsModel);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("patchAppComponents throws error on failure", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockPatchTestAppComponents(testId, 403);

        apiService.setTestId(testId);
        await expect(apiService.patchAppComponents(Constants.appComponentsModel)).rejects.toThrow("Error in updating app components");
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("patchServerMetricsConfig returns resp on 201", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockPatchTestServerMetricConfigs(testId, 201, ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);

        apiService.setTestId(testId);
        let result = await apiService.patchServerMetricsConfig(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);

        expect(result).toEqual(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("patchServerMetricsConfig returns resp on 200", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockPatchTestServerMetricConfigs(testId, 200, ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);

        apiService.setTestId(testId);
        let result = await apiService.patchServerMetricsConfig(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);

        expect(result).toEqual(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("patchServerMetricsConfig throws error on failure", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockPatchTestServerMetricConfigs(testId, 403);

        apiService.setTestId(testId);
        await expect(apiService.patchServerMetricsConfig(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload)).rejects.toThrow("Error in updating server metrics");
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("createTestRun returns resp on 201", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockCreateTestRun(Constants.loadtestConfig.testRunId, 201, TestRunResponseConstants.testRunNonTerminalResponse);

        apiService.setTestId(testId);
        let result = await apiService.createTestRun(TestRunResponseConstants.testRunNonTerminalResponse);

        expect(result).toEqual(TestRunResponseConstants.testRunNonTerminalResponse);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("createTestRun returns resp on 200", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockCreateTestRun(Constants.loadtestConfig.testRunId, 200, TestRunResponseConstants.testRunNonTerminalResponse);

        apiService.setTestId(testId);
        let result = await apiService.createTestRun(TestRunResponseConstants.testRunNonTerminalResponse);

        expect(result).toEqual(TestRunResponseConstants.testRunNonTerminalResponse);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("createTestRun throws error on failure", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockCreateTestRun(Constants.loadtestConfig.testRunId, 400);

        apiService.setTestId(testId);
        await expect(apiService.createTestRun(TestRunResponseConstants.testRunNonTerminalResponse)).rejects.toThrow("Error in running the test");
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });

    it("getTestRunAPI throws error on failure", async () => {
        let testId = "testid1";
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTestRun(Constants.loadtestConfig.testRunId, 400);

        apiService.setTestId(testId);
        await expect(apiService.getTestRunAPI(Constants.loadtestConfig.testRunId)).rejects.toThrow("Error in getting the test run");
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(true);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(false);
    });
})