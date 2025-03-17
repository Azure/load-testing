import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { TestSupport } from "./Utils/TestSupport";
import { CoreMock } from "./Mocks/CoreMock";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import * as TestReponseConstants from "./Constants/TestReponseConstants";
import * as TestRunResponseConstants from "./Constants/TestRunResponseConstants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import * as TestPayloadConstants from './Constants/TestPayloadConstants';
import { CreateAndRunTest } from "../src/RunnerFiles/CreateAndRunTest";
import * as testYamls from "./Constants/testYamls";
import { FileType, TestModel } from "../src/models/PayloadModels";
import { PostTaskParameters, reportZipFileName, resultZipFileName } from "../src/models/UtilModels";
import { TestKind } from "../src/models/TestKind";
import * as FileUtils from '../src/Utils/FileUtils';

describe('create and run test', () => {

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

    it("create jmx test flow", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createJmxTestExpectedPayload);
        let patchAppComponentsStub = sinon.stub(APIService.prototype, "patchAppComponents");
        let patchServerMetricsConfigStub = sinon.stub(APIService.prototype, "patchServerMetricsConfig");
        let createTestRunStub = sinon.stub(APIService.prototype, "createTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationCompletedResponse);
        let awaitTestRunTerminationsStub = sinon.stub(runner, "awaitTerminationForTestRun").resolves(TestRunResponseConstants.testRunTerminalResponse);
        let awaitResultsPopulationStub = sinon.stub(runner, "awaitResultsPopulation").resolves(TestRunResponseConstants.testRunTerminalWithResultsResponse);

        await runner.createAndRunTest();

        expect(getTestAPIStub.calledOnce).toBe(true);
        expect(getAppComponentsStub.notCalled).toBe(true);
        expect(getServerMetricsConfigStub.notCalled).toBe(true);
        expect(deleteFileAPIStub.notCalled).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.TEST_SCRIPT)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ADDITIONAL_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ZIPPED_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.USER_PROPERTIES)).toBe(true);
        expect(createTestAPIStub.calledOnce).toBe(true);
        expect(patchAppComponentsStub.calledOnce).toBe(true);
        expect(patchServerMetricsConfigStub.calledOnce).toBe(true);
        expect(createTestRunStub.calledOnce).toBe(true);
        expect(awaitTestTerminationsStub.calledOnce).toBe(true);
        expect(awaitTestRunTerminationsStub.calledOnce).toBe(true);
        expect(awaitResultsPopulationStub.calledOnce).toBe(true);

        let testRunId = coreMock.getVariable(PostTaskParameters.runId);
        let isRunCompleted = coreMock.getVariable(PostTaskParameters.isRunCompleted);

        expect(testRunId).toBe(TestRunResponseConstants.testRunNonTerminalResponse.testRunId);
        expect(isRunCompleted).toBe("true");
    });

    it("edit jmx test flow", async () => {
        let yamlJSON : any = 
        {
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.jmx',
            testType: 'JMX',
            engineInstances: 2,
            configurationFiles: [ 'sampledata.csv' ],
            zipArtifacts: [ 'bigdata.zip' ],
            properties: { userPropertyFile: 'user.properties' },
        }

        let existingTestObj: TestModel = {
            testId: 'sampletest',
            displayName: 'Sample Test',
            kind: TestKind.JMX,
            inputArtifacts: {
                testScriptFileInfo: {
                    url: "https://testurl",
                    fileType: FileType.JMX_FILE,
                    fileName: "sample.jmx",
                    validationStatus: "VALIDATION_SUCCESS",
                },
                additionalFileInfo: [
                    {
                        url: "https://testurl",
                        fileType: FileType.ADDITIONAL_ARTIFACTS,
                        fileName: "sampledata.csv",
                        validationStatus: "VALIDATION_SUCCESS",
                    },
                    {
                        url: "https://testurl",
                        fileType: FileType.ADDITIONAL_ARTIFACTS,
                        fileName: "sampledata1.csv",
                        validationStatus: "VALIDATION_SUCCESS",
                    },
                    {
                        url: "https://testurl",
                        fileType: FileType.ZIPPED_ARTIFACTS,
                        fileName: "bigdata.zip",
                        validationStatus: "VALIDATION_SUCCESS",
                    },
                    {
                        url: "https://testurl",
                        fileType: FileType.ZIPPED_ARTIFACTS,
                        fileName: "bigdata1.zip",
                        validationStatus: "VALIDATION_SUCCESS",
                    }
                ],
                userPropFileInfo: {
                    url: "https://testurl",
                    fileType: FileType.USER_PROPERTIES,
                    fileName: "user.properties",
                    validationStatus: "VALIDATION_SUCCESS",
                },
            }
        }
        TestSupport.createAndSetLoadTestConfigFile(yamlJSON, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(existingTestObj);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(existingTestObj);
        let patchAppComponentsStub = sinon.stub(APIService.prototype, "patchAppComponents");
        let patchServerMetricsConfigStub = sinon.stub(APIService.prototype, "patchServerMetricsConfig");
        let createTestRunStub = sinon.stub(APIService.prototype, "createTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationCompletedResponse);
        let awaitTestRunTerminationsStub = sinon.stub(runner, "awaitTerminationForTestRun").resolves(TestRunResponseConstants.testRunTerminalResponse);
        let awaitResultsPopulationStub = sinon.stub(runner, "awaitResultsPopulation").resolves(TestRunResponseConstants.testRunTerminalWithResultsResponse);

        await runner.createAndRunTest();

        expect(getTestAPIStub.calledOnce).toBe(true);
        expect(getAppComponentsStub.calledOnce).toBe(true);
        expect(getServerMetricsConfigStub.calledOnce).toBe(true);
        expect(deleteFileAPIStub.calledWith("sampledata1.csv")).toBe(true);
        expect(deleteFileAPIStub.calledWith("sampledata.csv")).toBe(false); // File present in yaml is not deleted
        expect(deleteFileAPIStub.calledWith("bigdata1.zip")).toBe(true);
        expect(deleteFileAPIStub.calledWith("bigdata.zip")).toBe(false); // File present in yaml is not deleted
        expect(deleteFileAPIStub.calledWith("user.properties")).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.TEST_SCRIPT)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ADDITIONAL_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ZIPPED_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.USER_PROPERTIES)).toBe(true);
        expect(createTestAPIStub.calledOnce).toBe(true);
        expect(patchAppComponentsStub.calledOnce).toBe(true);
        expect(patchServerMetricsConfigStub.calledOnce).toBe(true);
        expect(createTestRunStub.calledOnce).toBe(true);
        expect(awaitTestTerminationsStub.calledOnce).toBe(true);
        expect(awaitTestRunTerminationsStub.calledOnce).toBe(true);
        expect(awaitResultsPopulationStub.calledOnce).toBe(true);

        let testRunId = coreMock.getVariable(PostTaskParameters.runId);
        let isRunCompleted = coreMock.getVariable(PostTaskParameters.isRunCompleted);

        expect(testRunId).toBe(TestRunResponseConstants.testRunNonTerminalResponse.testRunId);
        expect(isRunCompleted).toBe("true");
    });

    it("create url test flow", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.urlYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createUrlTestExpectedPayload);
        let patchAppComponentsStub = sinon.stub(APIService.prototype, "patchAppComponents");
        let patchServerMetricsConfigStub = sinon.stub(APIService.prototype, "patchServerMetricsConfig");
        let createTestRunStub = sinon.stub(APIService.prototype, "createTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationCompletedResponse);
        let awaitTestRunTerminationsStub = sinon.stub(runner, "awaitTerminationForTestRun").resolves(TestRunResponseConstants.testRunTerminalResponse);
        let awaitResultsPopulationStub = sinon.stub(runner, "awaitResultsPopulation").resolves(TestRunResponseConstants.testRunTerminalWithResultsResponse);

        await runner.createAndRunTest();

        expect(getTestAPIStub.calledOnce).toBe(true);
        expect(getAppComponentsStub.notCalled).toBe(true);
        expect(getServerMetricsConfigStub.notCalled).toBe(true);
        expect(deleteFileAPIStub.notCalled).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.TEST_SCRIPT)).toBe(false);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.URL_TEST_CONFIG)).toBe(true); // URL test config file is uploaded
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ADDITIONAL_ARTIFACTS)).toBe(true);
        expect(createTestAPIStub.calledOnce).toBe(true);
        expect(patchAppComponentsStub.calledOnce).toBe(true);
        expect(patchServerMetricsConfigStub.calledOnce).toBe(true);
        expect(createTestRunStub.calledOnce).toBe(true);
        expect(awaitTestTerminationsStub.calledOnce).toBe(true);
        expect(awaitTestRunTerminationsStub.calledOnce).toBe(true);
        expect(awaitResultsPopulationStub.calledOnce).toBe(true);

        let testRunId = coreMock.getVariable(PostTaskParameters.runId);
        let isRunCompleted = coreMock.getVariable(PostTaskParameters.isRunCompleted);

        expect(testRunId).toBe(TestRunResponseConstants.testRunNonTerminalResponse.testRunId);
        expect(isRunCompleted).toBe("true");
    });

    it("file validation failed", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.urlYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createUrlTestExpectedPayload);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationFailedResponse);

        expect(async () => await runner.createAndRunTest()).rejects.toThrow("TestPlan validation Failed.");
    });

    it("additional file validation failed", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.urlYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createUrlTestExpectedPayload);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testAdditionalFileValidationFailedResponse);

        expect(async () => await runner.createAndRunTest()).rejects.toThrow("Validation of one or more files failed. Please correct the errors and try again.");
    });

    it("file validation timeout", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.urlYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createUrlTestExpectedPayload);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationPendingResponse);

        expect(async () => await runner.createAndRunTest()).rejects.toThrow("TestPlan validation timeout. Please try again.");
    });

    it("test run status failed", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createJmxTestExpectedPayload);
        let patchAppComponentsStub = sinon.stub(APIService.prototype, "patchAppComponents");
        let patchServerMetricsConfigStub = sinon.stub(APIService.prototype, "patchServerMetricsConfig");
        let createTestRunStub = sinon.stub(APIService.prototype, "createTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationCompletedResponse);
        let awaitTestRunTerminationsStub = sinon.stub(runner, "awaitTerminationForTestRun").resolves(TestRunResponseConstants.testRunFailedResponse);
        let awaitResultsPopulationStub = sinon.stub(runner, "awaitResultsPopulation").resolves(TestRunResponseConstants.testRunFailedResponse);

        await runner.createAndRunTest();

        expect(getTestAPIStub.calledOnce).toBe(true);
        expect(getAppComponentsStub.notCalled).toBe(true);
        expect(getServerMetricsConfigStub.notCalled).toBe(true);
        expect(deleteFileAPIStub.notCalled).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.TEST_SCRIPT)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ADDITIONAL_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ZIPPED_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.USER_PROPERTIES)).toBe(true);
        expect(createTestAPIStub.calledOnce).toBe(true);
        expect(patchAppComponentsStub.calledOnce).toBe(true);
        expect(patchServerMetricsConfigStub.calledOnce).toBe(true);
        expect(createTestRunStub.calledOnce).toBe(true);
        expect(awaitTestTerminationsStub.calledOnce).toBe(true);
        expect(awaitTestRunTerminationsStub.calledOnce).toBe(true);
        expect(awaitResultsPopulationStub.calledOnce).toBe(true);

        let testRunId = coreMock.getVariable(PostTaskParameters.runId);
        let isRunCompleted = coreMock.getVariable(PostTaskParameters.isRunCompleted);
        let taskResult = coreMock.getResult();

        expect(testRunId).toBe(TestRunResponseConstants.testRunNonTerminalResponse.testRunId);
        expect(isRunCompleted).toBe("true");
        expect(taskResult).toBe("FAILED");
    });

    it("test run result failed", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createJmxTestExpectedPayload);
        let patchAppComponentsStub = sinon.stub(APIService.prototype, "patchAppComponents");
        let patchServerMetricsConfigStub = sinon.stub(APIService.prototype, "patchServerMetricsConfig");
        let createTestRunStub = sinon.stub(APIService.prototype, "createTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationCompletedResponse);
        let awaitTestRunTerminationsStub = sinon.stub(runner, "awaitTerminationForTestRun").resolves(TestRunResponseConstants.testRunResultFailedResponse);
        let awaitResultsPopulationStub = sinon.stub(runner, "awaitResultsPopulation").resolves(TestRunResponseConstants.testRunResultFailedResponse);

        await runner.createAndRunTest();

        expect(getTestAPIStub.calledOnce).toBe(true);
        expect(getAppComponentsStub.notCalled).toBe(true);
        expect(getServerMetricsConfigStub.notCalled).toBe(true);
        expect(deleteFileAPIStub.notCalled).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.TEST_SCRIPT)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ADDITIONAL_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ZIPPED_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.USER_PROPERTIES)).toBe(true);
        expect(createTestAPIStub.calledOnce).toBe(true);
        expect(patchAppComponentsStub.calledOnce).toBe(true);
        expect(patchServerMetricsConfigStub.calledOnce).toBe(true);
        expect(createTestRunStub.calledOnce).toBe(true);
        expect(awaitTestTerminationsStub.calledOnce).toBe(true);
        expect(awaitTestRunTerminationsStub.calledOnce).toBe(true);
        expect(awaitResultsPopulationStub.calledOnce).toBe(true);

        let testRunId = coreMock.getVariable(PostTaskParameters.runId);
        let isRunCompleted = coreMock.getVariable(PostTaskParameters.isRunCompleted);
        let taskResult = coreMock.getResult();

        expect(testRunId).toBe(TestRunResponseConstants.testRunNonTerminalResponse.testRunId);
        expect(isRunCompleted).toBe("true");
        expect(taskResult).toBe("FAILED");
    });

    it("test run results file published", async () => {
        TestSupport.createAndSetLoadTestConfigFile(testYamls.jmxComprehensiveYaml, coreMock, "createAndRunTest.yaml");
        
        let getTestAPIStub = sinon.stub(APIService.prototype, "getTestAPI").resolves(null);
        let getAppComponentsStub = sinon.stub(APIService.prototype, "getAppComponents").resolves(null);
        let getServerMetricsConfigStub = sinon.stub(APIService.prototype, "getServerMetricsConfig").resolves(null);
        let uploadFilesStub = sinon.stub(APIService.prototype, "uploadFile");
        let deleteFileAPIStub = sinon.stub(APIService.prototype, "deleteFileAPI");
        let createTestAPIStub = sinon.stub(APIService.prototype, "createTestAPI").resolves(TestPayloadConstants.createJmxTestExpectedPayload);
        let patchAppComponentsStub = sinon.stub(APIService.prototype, "patchAppComponents");
        let patchServerMetricsConfigStub = sinon.stub(APIService.prototype, "patchServerMetricsConfig");
        let createTestRunStub = sinon.stub(APIService.prototype, "createTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitTestTerminationsStub = sinon.stub(runner, "awaitTerminationForFileValidation").resolves(TestReponseConstants.testFileValidationCompletedResponse);
        let awaitTestRunTerminationsStub = sinon.stub(runner, "awaitTerminationForTestRun").resolves(TestRunResponseConstants.testRunNonTerminalResponse);
        let awaitResultsPopulationStub = sinon.stub(runner, "awaitResultsPopulation").resolves(TestRunResponseConstants.testRunTerminalWithResultsAndReportFilesResponse);

        nock(TestRunResponseConstants.testRunTerminalWithResultsAndReportFilesResponse.testArtifacts!.outputArtifacts.resultFileInfo!.url!)
            .get("")
            .reply(200);

        nock(TestRunResponseConstants.testRunTerminalWithResultsAndReportFilesResponse.testArtifacts!.outputArtifacts.reportFileInfo!.url!)
            .get("")
            .reply(200);

        let uploadFileToResultsFolderStub = sinon.stub(FileUtils, "uploadFileToResultsFolder").resolves();

        await runner.createAndRunTest();

        expect(getTestAPIStub.calledOnce).toBe(true);
        expect(getAppComponentsStub.notCalled).toBe(true);
        expect(getServerMetricsConfigStub.notCalled).toBe(true);
        expect(deleteFileAPIStub.notCalled).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.TEST_SCRIPT)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ADDITIONAL_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.ZIPPED_ARTIFACTS)).toBe(true);
        expect(uploadFilesStub.calledWithMatch(sinon.match.any, FileType.USER_PROPERTIES)).toBe(true);
        expect(createTestAPIStub.calledOnce).toBe(true);
        expect(patchAppComponentsStub.calledOnce).toBe(true);
        expect(patchServerMetricsConfigStub.calledOnce).toBe(true);
        expect(createTestRunStub.calledOnce).toBe(true);
        expect(awaitTestTerminationsStub.calledOnce).toBe(true);
        expect(awaitTestRunTerminationsStub.calledOnce).toBe(true);
        expect(awaitResultsPopulationStub.calledOnce).toBe(true);

        expect(uploadFileToResultsFolderStub.calledWithMatch(sinon.match.any, resultZipFileName)).toBe(true);
        expect(uploadFileToResultsFolderStub.calledWithMatch(sinon.match.any, reportZipFileName)).toBe(true);

        let testRunId = coreMock.getVariable(PostTaskParameters.runId);
        let isRunCompleted = coreMock.getVariable(PostTaskParameters.isRunCompleted);

        expect(testRunId).toBe(TestRunResponseConstants.testRunNonTerminalResponse.testRunId);
        expect(isRunCompleted).toBe("true");
    });

})