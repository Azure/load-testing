import nock from "nock";
import * as sinon from "sinon";
import { TaskLibMock } from "./Mocks/TaskLibMock";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import { TestSupport } from "./Utils/TestSupport";
import { APIService } from "../src/services/APIService";
import { run } from "../src/postProcessJob";
import { PostTaskParameters } from "../src/models/UtilModels";

describe('post process job tests', () => {

    let taskLibMock: TaskLibMock;
    let authenticatorServiceMock: AuthenticatorServiceMock;

    beforeEach(function () {
        taskLibMock = new TaskLibMock();
        authenticatorServiceMock = new AuthenticatorServiceMock();
        authenticatorServiceMock.setupMock();
        TestSupport.setupTaskLibMockForTaskParameters(taskLibMock);
    });
  
    afterEach(function () {
        nock.cleanAll();
        sinon.restore();
    });

    it("stop is called when test run is not terminated", async () => {
        let stopTestRunStub = sinon.stub(APIService.prototype, "stopTestRun");
        TestSupport.setupTaskLibMockForPostProcess(taskLibMock);

        await run();

        expect(stopTestRunStub.calledOnce).toEqual(true);
    });

    it("stop is not called when test run is terminated", async () => {
        let stopTestRunStub = sinon.stub(APIService.prototype, "stopTestRun");
        TestSupport.setupTaskLibMockForPostProcess(taskLibMock);
        taskLibMock.setTaskVariable(PostTaskParameters.isRunCompleted, 'true');

        await run();

        expect(stopTestRunStub.called).toBe(false);
    });
})