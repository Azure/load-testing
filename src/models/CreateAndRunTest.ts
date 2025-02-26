import { isNullOrUndefined } from "util";
import { APIService } from "./APIService";
import { AppComponents, FileType, ExistingParams, FileInfo, TestModel, TestRunModel, FileStatus } from "./PayloadModels";
import { YamlConfig } from "./TaskModels";
import { addExistingParameters, getAllFileNamesTobeDeleted, validateAndGetOutputVarName, getPayloadForAppcomponents, getPayloadForTest, validateAndGetRuntimeParamsForTestRun, getTestRunPayload, mergeExistingServerCriteria, validateAndSetOverrideParams } from "./CreateAndRunHelper";
import { FetchCallType, OutputVariableInterface, OutPutVariablesConstants, PostTaskParameters, reportZipFileName, resultZipFileName, RunTimeParams, ValidationType } from "./UtilModels";
import { TestKind } from "./engine/TestKind";
import * as Util from "./util";
import * as FileUtils from './FileUtils';
import * as FetchUtil from './FetchHelper';
import * as CoreUtils from './CoreUtils';

export async function createAndRunTest(apiService: APIService) {
    let yamlConfig = new YamlConfig();
    validateAndSetOverrideParams(yamlConfig);
    apiService.setTestId(yamlConfig.testId);
    let testObj : TestModel | null = await apiService.getTestAPI(true);
    let isCreateTest = true;
    let existingParams: ExistingParams = { secrets: {}, env: {}, passFailCriteria: {}, passFailServerMetrics: {}, appComponents: new Map() };

    if(testObj){
        isCreateTest = false;
        let appComponentsObj: AppComponents | null = await apiService.getAppComponents();
        existingParams = addExistingParameters(testObj, appComponentsObj);
    }
    let testModel = getPayloadForTest(yamlConfig, existingParams);
    if(isCreateTest) {
        console.log("Creating a new load test "+yamlConfig.testId);
    }
    let createdTestObj = await apiService.createTestAPI(testModel);
    isCreateTest ? console.log(`Created test with id ${createdTestObj.testId}`) : console.log("Test '"+ createdTestObj.testId +"' already exists");
    let testFiles = createdTestObj.inputArtifacts;

    let filesToDelete = testFiles ? getAllFileNamesTobeDeleted(yamlConfig, testFiles) : [];
    if(filesToDelete.length > 0){
        console.log(`Deleting ${filesToDelete.length} existing test file(s) which is(are) not in the configuration yaml file.`);
    }
    for(const file of filesToDelete){
        await apiService.deleteFileAPI(file);
    }

    await uploadAllTestFiles(yamlConfig, apiService);
    let validatedTest = await awaitTerminations(yamlConfig.testId, apiService, ValidationType.test) as TestModel;
    checkForValidationsOfTest(validatedTest);

    let appComponents = getPayloadForAppcomponents(yamlConfig, existingParams);
    let appComponentsResp = await apiService.patchAppComponents(appComponents);
    appComponentsResp && console.log("Updated app components successfully");

    let existingServerMetricsConfig = await apiService.getServerMetricsConfig();
    let serverMetricsConfig = mergeExistingServerCriteria(existingServerMetricsConfig, yamlConfig);
    await apiService.patchServerMetricsConfig(serverMetricsConfig);
    serverMetricsConfig && console.log("Updated server metrics successfully");

    console.log("Creating and running a testRun for the test");
    let runTimeParamsofTestRun : RunTimeParams = validateAndGetRuntimeParamsForTestRun(yamlConfig.testId);
    let createTestrunPayLoad : TestRunModel = getTestRunPayload(runTimeParamsofTestRun);
    let testRunResult = await apiService.createTestRun(createTestrunPayLoad);
    testRunResult.status && printPortalUrl(testRunResult.displayName || '', yamlConfig.displayName, apiService.authContext.subscriptionName, apiService.authContext.resourceId);

    CoreUtils.exportVariable(PostTaskParameters.runId, testRunResult.testRunId);

    await awaitTerminations(testRunResult.testRunId, apiService, ValidationType.testrun);
    testRunResult = await awaitResultsPopulation(testRunResult.testRunId, apiService) ?? testRunResult;
    CoreUtils.exportVariable(PostTaskParameters.isRunCompleted, 'true');

    printMetrics(testRunResult);
    await uploadResultsToPipeline(testRunResult);
    setTaskResults(testRunResult);
    setOutputVariable(testRunResult);
}

async function uploadAllTestFiles(yamlModel: YamlConfig, apiService: APIService) : Promise<void> {
    let configFiles = yamlModel.configurationFiles;
    if(configFiles.length > 0) {
        console.log("Uploading the configuration files");
        await uploadFiles(configFiles, apiService, FileType.ADDITIONAL_ARTIFACTS);
        console.log(`Uploaded ${configFiles.length} configuration file(s) for the test successfully.`);
    }

    let zipFiles = yamlModel.zipArtifacts;
    if(zipFiles.length > 0) {
        console.log("Uploading the zip artifacts");
        await uploadFiles(zipFiles, apiService, FileType.ZIPPED_ARTIFACTS);
        console.log(`Uploaded ${zipFiles.length} zip artifact(s) for the test successfully.`);
    }

    let propertyFile = yamlModel.propertyFile;
    if(propertyFile != undefined && propertyFile!= '') {
        console.log("Uploading the user properties file");
        await apiService.uploadFile(propertyFile, FileType.USER_PROPERTIES);
        console.log(`Uploaded user properties file for the test successfully.`);
    }

    await uploadTestScriptFile(yamlModel, apiService);

    return;
}

async function uploadFiles(configFiles: string[], apiService: APIService, fileType: FileType) : Promise<void> {
    if(configFiles.length > 0) {
        for(let filepath of configFiles){
            await apiService.uploadFile(filepath, fileType);
        };
    }
    return;
}

async function uploadTestScriptFile(yamlModel: YamlConfig, apiService: APIService) : Promise<void> {
    let testScriptFile = yamlModel.testPlan;
    let fileType = FileType.TEST_SCRIPT;
    if(yamlModel.kind == TestKind.URL){
        fileType = FileType.URL_TEST_CONFIG;
    }
    console.log("Uploading the test script file");
    await apiService.uploadFile(testScriptFile, fileType);
    console.log(`Uploaded test script file for the test successfully.`);
    return;
}

function printPortalUrl(testRunDisplayName: string, testDisplayName: string, subscriptionName: string, resourceId: string) : void {
    console.log("\nView the load test run in Azure portal by following the steps:");
    console.log("1. Go to your Azure Load Testing resource '"+Util.getResourceNameFromResourceId(resourceId)+"' in subscription '"+subscriptionName+"'");
    console.log("2. On the Tests page, go to test '"+testDisplayName+"'");
    console.log("3. Go to test run '"+testRunDisplayName+"'\n");
}

/*
* This function will wait for the test run to complete if the validation type is testrun.
    and waits for the validation of files to complete if the validation type is test.
*/
async function awaitTerminations(id: string, apiService : APIService, validationType: ValidationType) : Promise<TestModel| TestRunModel | null> {
    if(validationType == ValidationType.test){
        let minutesToAdd=10;
        let startTime = new Date();
        let maxAllowedTime = new Date(startTime.getTime() + minutesToAdd*60000);
        let validationStatus : string = FileStatus.VALIDATION_INITIATED;
        let testObj: TestModel | null = null;
        let retry = 5;
        while(maxAllowedTime>(new Date()) && !Util.isTerminalFileStatus(validationStatus)){
            await Util.sleep(5000);
            try{
                testObj = await apiService.getTestAPI();
                let inputScriptFileInfo: FileInfo | undefined
                testObj && (inputScriptFileInfo = testObj.kind == TestKind.URL ? testObj.inputArtifacts?.urlTestConfigFileInfo : testObj.inputArtifacts?.testScriptFileInfo);
                validationStatus = inputScriptFileInfo?.validationStatus ?? validationStatus;
            }
            catch(e) {
                retry--;
                if(retry == 0){
                    throw new Error("Unable to validate the test plan. Please retry. Failed with error :" + e);
                }
            }
        }
        return testObj;
    } else {
        let testRunStatus = "ACCEPTED";
        let testRunObj: TestRunModel | null = null;
        while(!Util.isTerminalTestStatus(testRunStatus)) {
            if(testRunStatus === "DEPROVISIONING" || testRunStatus === "DEPROVISIONED" || testRunStatus == "EXECUTED" )
                await Util.sleep(5000);
            else
                await Util.sleep(20000);

            testRunObj = await apiService.getTestRunAPI(id);
            testRunStatus = testRunObj.status ?? testRunStatus;
        }
        return testRunObj;
    }
}

function checkForValidationsOfTest(testObj: TestModel) : void {
    let validationStatus = testObj.inputArtifacts?.testScriptFileInfo?.validationStatus ?? FileStatus.VALIDATION_INITIATED;
    console.log("Validation status of the test plan: "+ validationStatus);

    if(Util.isTerminalFileStatusSucceeded(validationStatus)) {
        console.log(`Validated test plan for the test successfully.`);
        
        // Get errors from all files
        let fileErrors = Util.getAllFileErrors(testObj);

        if (Object.keys(fileErrors).length > 0) {
            console.log("Validation failed for the following files:");
            for (const [file, error] of Object.entries(fileErrors)) {
                console.log(`File: ${file}, Error: ${error}`);
            }
            throw new Error("Validation of one or more files failed. Please correct the errors and try again.");
        }
    }
    else if(!Util.isTerminalFileStatus(validationStatus)){
        throw new Error("TestPlan validation timeout. Please try again.")
    }
    else
        throw new Error("TestPlan validation Failed.");
    return;
}

async function awaitResultsPopulation(testRunId: string, apiService: APIService) : Promise<TestRunModel | null> {
    let vusers = null;
    let count = 0;
    let reportsAvailable = false;
    let testRunObj : TestRunModel | null = null;
    console.log("Test run completed. Polling for statistics and dashboard report to populate.");
    // Polling for max 5 min for statistics and pass fail criteria to populate
    while((!reportsAvailable || isNullOrUndefined(vusers)) && count < 30){
        await Util.sleep(10000);
        testRunObj = await apiService.getTestRunAPI(testRunId);
        vusers = testRunObj.virtualUsers;
        count++;
        let testReport = Util.getReportFolder(testRunObj.testArtifacts);
        if(testReport) {
            reportsAvailable = true;
        }
    }
    return testRunObj;
}

function printMetrics(testRunObj: TestRunModel) : void {
    Util.printTestDuration(testRunObj);
    if(!isNullOrUndefined(testRunObj.passFailCriteria) && !isNullOrUndefined(testRunObj.passFailCriteria.passFailMetrics))
        Util.printCriteria(testRunObj.passFailCriteria.passFailMetrics)
    if(testRunObj.testRunStatistics != null && testRunObj.testRunStatistics != undefined)
        Util.printClientMetrics(testRunObj.testRunStatistics);
}

async function uploadResultsToPipeline(testRunObj: TestRunModel) : Promise<void> {
    let testResultUrl = Util.getResultFolder(testRunObj.testArtifacts);
    if(testResultUrl != null) {
        const response = await FetchUtil.httpClientRetries(testResultUrl,{},FetchCallType.get,3,"");
        if (response.message.statusCode != 200) {
            let respObj:any = await Util.getResultObj(response);
            console.log(respObj ? respObj : Util.errorCorrection(response));
            throw new Error("Error in fetching results ");
        }
        else {
            await FileUtils.uploadFileToResultsFolder(response, resultZipFileName);
        }
    }
    let testReportUrl = Util.getReportFolder(testRunObj.testArtifacts);
    if(testReportUrl != null) {
        const response = await FetchUtil.httpClientRetries(testReportUrl,{},FetchCallType.get,3,"");
        if (response.message.statusCode != 200) {
            let respObj:any = await Util.getResultObj(response);
            console.log(respObj ? respObj : Util.errorCorrection(response));
            throw new Error("Error in fetching report ");
        }
        else {
            await FileUtils.uploadFileToResultsFolder(response, reportZipFileName);
        }
    }
}

function setTaskResults(testRunObj: TestRunModel) : void {
    if(!isNullOrUndefined(testRunObj.testResult) && Util.isStatusFailed(testRunObj.testResult)) {
        CoreUtils.setFailed("TestResult: "+ testRunObj.testResult);
    }
    if(!isNullOrUndefined(testRunObj.status) && Util.isStatusFailed(testRunObj.status)) {
        console.log("Please go to the Portal for more error details: "+ testRunObj.portalUrl);
        CoreUtils.setFailed("TestStatus: "+ testRunObj.status);
    }
}

function setOutputVariable(testRunObj: TestRunModel) {
    let outputVarName = validateAndGetOutputVarName();
    let outputVar: OutputVariableInterface = {
        testRunId: testRunObj.testRunId
    }

    CoreUtils.setOutput(`${outputVarName}.${OutPutVariablesConstants.testRunId}`, outputVar.testRunId);
}