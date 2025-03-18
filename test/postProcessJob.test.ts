import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import { TestSupport } from "./Utils/TestSupport";
import { APIService } from "../src/services/APIService";
import { run } from "../src/postProcessJob";
import * as Constants from "./Constants/Constants";
import * as EnvironmentConstants from "../src/Constants/EnvironmentConstants";
import * as AzCliUtility from "../src/Utils/AzCliUtility";

describe('post process job tests', () => {

    let authenticatorServiceMock: AuthenticatorServiceMock;

    beforeEach(function () {
        authenticatorServiceMock = new AuthenticatorServiceMock();
        authenticatorServiceMock.setupMock();
    });
  
    afterEach(function () {
        nock.cleanAll();
        sinon.restore();
    });

    it("stop is called when test run is not terminated", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let cloudShowResult = {
            name: EnvironmentConstants.AzurePublicCloud.cloudName,
            endpoints: {
                resourceManager: Constants.armEndpoint,
            }
        };
        // account show is not called so 1st call is cloud show
        stub.onFirstCall().resolves(cloudShowResult);
        let stopTestRunStub = sinon.stub(APIService.prototype, "stopTestRun");
        TestSupport.setupMockForPostProcess();

        await run();

        expect(stopTestRunStub.calledOnce).toEqual(true);
    });

    it("stop is not called when test run is terminated", async () => {
        let stub = sinon.stub(AzCliUtility, "execAz");
        let cloudShowResult = {
            name: EnvironmentConstants.AzurePublicCloud.cloudName,
            endpoints: {
                resourceManager: Constants.armEndpoint,
            }
        };
        // account show is not called so 1st call is cloud show
        stub.onFirstCall().resolves(cloudShowResult);
        let stopTestRunStub = sinon.stub(APIService.prototype, "stopTestRun");
        TestSupport.setupMockForPostProcess(true);

        await run();

        expect(stopTestRunStub.called).toBe(false);
    });
})