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
import * as AppComponentsPayloadConstants from "./Constants/AppComponentsPayloadConstants";

describe('app component payload tests', () => {

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

    it("create app component", async () => {
        TestSupport.createAndSetLoadTestConfigFile(AppComponentsAndServerConfigYamls.appComponentsWithMetrics, coreMock, "appCompLoadtestConfig.yaml");
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 404);

        await runner.initialize();
        let appCompPayload = await runner.getAppComponentsPayload();

        expect(appCompPayload).toEqual(AppComponentsPayloadConstants.createAppComponentsExpectedPayload);
    });

    it("edit app component", async () => {
        TestSupport.createAndSetLoadTestConfigFile(AppComponentsAndServerConfigYamls.appComponentsWithMetrics, coreMock, "appCompLoadtestConfig.yaml");
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetTest(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 200);
        dataPlaneAPIMock.mockGetTestAppComponents(AppComponentsAndServerConfigYamls.appComponentsWithMetrics.testId.toLowerCase()!, 200, AppComponentsPayloadConstants.editAppComponentsResponse);

        await runner.initialize();
        let appCompPayload = await runner.getAppComponentsPayload();

        expect(appCompPayload).toEqual(AppComponentsPayloadConstants.editAppComponentsExpectedPayload);
    });
})