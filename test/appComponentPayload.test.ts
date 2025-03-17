import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { TestSupport } from "./Utils/TestSupport";
import { TaskLibMock } from "./Mocks/TaskLibMock";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import * as AppComponentsAndServerConfigYamls from './Constants/AppComponentsAndServerConfigYamls';
import { CreateAndRunTest } from "../src/RunnerFiles/CreateAndRunTest";
import { DataPlaneAPIMock } from "./Mocks/DataPlaneAPIMock";
import * as AppComponentsPayloadConstants from "./Constants/AppComponentsPayloadConstants";

describe('app component payload tests', () => {

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

    it("create app component", async () => {
        TestSupport.createAndSetLoadTestConfigFile(AppComponentsAndServerConfigYamls.appComponentsWithMetrics, taskLibMock, "appCompLoadtestConfig.yaml");
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 404);

        await runner.initialize();
        let appCompPayload = await runner.getAppComponentsPayload();

        expect(appCompPayload).toEqual(AppComponentsPayloadConstants.createAppComponentsExpectedPayload);
    });

    it("edit app component", async () => {
        TestSupport.createAndSetLoadTestConfigFile(AppComponentsAndServerConfigYamls.appComponentsWithMetrics, taskLibMock, "appCompLoadtestConfig.yaml");
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 200);
        dataPlaneAPIMock.mockGetTestAppComponents(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 200, AppComponentsPayloadConstants.editAppComponentsResponse);

        await runner.initialize();
        let appCompPayload = await runner.getAppComponentsPayload();

        expect(appCompPayload).toEqual(AppComponentsPayloadConstants.editAppComponentsExpectedPayload);
    });
})