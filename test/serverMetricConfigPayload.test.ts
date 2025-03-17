import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { TestSupport } from "./Utils/TestSupport";
import { CoreMock } from "./Mocks/CoreMock";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import * as AppComponentsAndServerConfigYamls from './Constants/AppComponentsAndServerConfigYamls';
import { CreateAndRunTest } from "../src/RunnerFiles/CreateAndRunTest";
import { DataPlaneAPIMock } from "./Mocks/DataPlaneAPIMock";
import * as ServerMetricConfigPayloadConstants from "./Constants/ServerMetricConfigPayloadConstants";

describe('server metric config payload tests', () => {

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

    it("create server metric config", async () => {
        TestSupport.createAndSetLoadTestConfigFile(AppComponentsAndServerConfigYamls.appComponentsWithMetrics, coreMock, "serverMetricLoadtestConfig.yaml");
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 404);

        await runner.initialize();
        let serverMetricConfigPayload = await runner.getServerMetricsConfigPayload();

        expect(serverMetricConfigPayload).toEqual(ServerMetricConfigPayloadConstants.createServerMetricConfigExpectedPayload);
    });

    it("edit server metric config", async () => {
        TestSupport.createAndSetLoadTestConfigFile(AppComponentsAndServerConfigYamls.appComponentsWithMetrics, coreMock, "serverMetricLoadtestConfig.yaml");
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 200);
        dataPlaneAPIMock.mockGetTestServerMetricConfigs(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 200, ServerMetricConfigPayloadConstants.editServerMetricConfigResponse);

        await runner.initialize();
        let serverMetricConfigPayload = await runner.getServerMetricsConfigPayload();

        expect(serverMetricConfigPayload).toEqual(ServerMetricConfigPayloadConstants.editServerMetricConfigExpectedPayload);
    });
})