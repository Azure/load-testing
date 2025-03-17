import { IHttpClientResponse } from 'typed-rest-client/Interfaces';
const { v4: uuidv4 } = require('uuid');
import { isNullOrUndefined } from 'util';
import { autoStopDisable, OverRideParametersModel } from '../Constants/GeneralConstants';
import { PassFailMetric, Statistics, TestRunArtifacts, TestRunModel, TestModel, FileStatus } from '../models/PayloadModels';
import { RunTimeParams, PassFailCount, ReferenceIdentityKinds, AllManagedIdentitiesSegregated, ValidationModel } from '../models/UtilModels';
import * as InputConstants from '../Constants/InputConstants';
import * as path from 'path';

export function checkFileType(filePath: string, fileExtToValidate: string): boolean{
    if(isNullOrUndefined(filePath)){
        return false;
    }
    let split = filePath.split('.');
    return split[split.length-1].toLowerCase() == fileExtToValidate.toLowerCase();
}

export function checkFileTypes(filePath: string, fileExtsToValidate: string[]): boolean{
    if(isNullOrUndefined(filePath)){
        return false;
    }
    let split = filePath.split('.');
    let fileExtsToValidateLower = fileExtsToValidate.map(ext => ext.toLowerCase());
    return fileExtsToValidateLower.includes(split[split.length-1]?.toLowerCase());
}

export async function printTestDuration(testRunObj: TestRunModel) {
    console.log("Summary generation completed\n");
    console.log("-------------------Summary ---------------");
    console.log("TestRun start time: "+ new Date(testRunObj.startDateTime ?? new Date()));
    console.log("TestRun end time: "+ new Date(testRunObj.endDateTime ?? new Date()));
    console.log("Virtual Users: "+ testRunObj.virtualUsers);
    console.log("TestStatus: "+ testRunObj.status + "\n");
    return;
}

export function printCriteria(criteria:{ [key: string]: PassFailMetric | null }) {
    if(Object.keys(criteria).length == 0)
        return;
    printTestResult(criteria);
    console.log("Criteria\t\t\t\t\t :Actual Value\t      Result");
    for(var key in criteria) {
        let metric = criteria[key];
        if(isNullOrUndefined(metric)) continue;

        var str = metric.aggregate+"("+metric.clientMetric+") "+ metric.condition+ ' '+metric.value;
        if(metric.requestName != null){
            str = metric.requestName + ": " + str;
        }
        //str += ((metric.clientmetric == "error") ? ", " : "ms, ") + metric.action;
        var spaceCount = 50 - str.length;
        while(spaceCount > 0){
            str+=' ';
            spaceCount--;
        }
        var actualValue = metric.actualValue ? metric.actualValue.toString() : '';
        spaceCount = 10 - (actualValue).length;
        while(spaceCount--)
            actualValue = actualValue + ' ';
        metric.result = metric.result ? metric.result.toUpperCase() : '';
        console.log(str + actualValue+"            "+ metric.result);
    }
    console.log("\n");
}

export function errorCorrection(result : IHttpClientResponse){
    return "Unable to fetch the response. Please re-run or contact support if the issue persists. " + "Status code :" + result.message.statusCode ;
}

function printTestResult(criteria:{ [key: string] :PassFailMetric | null}) : PassFailCount {
    let pass = 0; 
    let fail = 0;
    for(var key in criteria) {
        if(criteria[key]?.result == "passed")
            pass++;
        else if(criteria[key]?.result == "failed")
            fail++;
    }
    console.log("-------------------Test Criteria ---------------");
    console.log("Results\t\t\t :"+pass+" Pass "+fail+" Fail\n");
    return {pass, fail}; // returning so that we can use this in the UTs later.
}



function printMetrics(data: Statistics, key : string | null = null) {
    let samplerName : string | null = data.transaction ?? key;
    if(samplerName == 'Total'){
        samplerName = "Aggregate";
    }
    console.log("Sampler name \t\t : ",samplerName, "\n");
    console.log("response time \t\t : avg="+getAbsVal(data.meanResTime)+" ms, min="+getAbsVal(data.minResTime)+" ms, med="+getAbsVal(data.medianResTime)+" ms, max="+getAbsVal(data.maxResTime)+ " ms, p(75)="+getAbsVal(data.pct75ResTime)+" ms, p(90)="+getAbsVal(data.pct1ResTime)+" ms, p(95)="+getAbsVal(data.pct2ResTime)+" ms, p(96)="+getAbsVal(data.pct96ResTime)+" ms, p(98)="+getAbsVal(data.pct98ResTime)+" ms, p(99)="+getAbsVal(data.pct3ResTime)+" ms, p(99.9)="+getAbsVal(data.pct999ResTime)+" ms, p(99.99)="+getAbsVal(data.pct9999ResTime));
    console.log("requests per sec \t : avg="+getAbsVal(data.throughput));
    console.log("total requests \t\t : "+data.sampleCount);
    console.log("total errors \t\t : " + data.errorCount);
    console.log("total error rate \t : "+data.errorPct);
    console.log("\n");
}

export async function printClientMetrics( obj:{ [key: string]: Statistics }) {
    if(Object.keys(obj).length == 0)
        return;
    console.log("------------------Client-side metrics------------\n");
    for(var key in obj) {
        printMetrics(obj[key], key);
    }
}

function getAbsVal(data: number| undefined | null) {
    if(isNullOrUndefined(data)) {
        return "undefined";
    }
    let dataString : string = data.toString();
    let dataArray : string[] = dataString.split('.');
    return dataArray[0];
}

export function sleep(ms:number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}  

export function getUniqueId() {
    return uuidv4();
}

export function getResultFolder(testArtifacts:TestRunArtifacts | undefined) {
    if(isNullOrUndefined(testArtifacts) || isNullOrUndefined(testArtifacts.outputArtifacts))
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return !isNullOrUndefined(outputurl.resultFileInfo) ? outputurl.resultFileInfo.url: null;
}

export function getReportFolder(testArtifacts:TestRunArtifacts | undefined) {
    if(isNullOrUndefined(testArtifacts) || isNullOrUndefined(testArtifacts.outputArtifacts))
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return !isNullOrUndefined(outputurl.reportFileInfo) ? outputurl.reportFileInfo.url: null;
}

export function indexOfFirstDigit(input: string) {
    let i = 0;
    for (; input[i] < '0' || input[i] > '9'; i++);
    return i == input.length ? -1 : i;
}
export function removeUnits(input:string) 
{
    let i = 0;
    for (; input[i] >= '0' && input[i] <= '9'; i++);
    return i == input.length ? input : input.substring(0,i);
}

export function isTerminalTestStatus(testStatus: string){
    if(testStatus == "DONE" || testStatus === "FAILED" || testStatus === "CANCELLED"){
        return true;
    }
    return false;
}

export function isTerminalFileStatus(fileStatus: string){
    let fileStatusEnum = fileStatus as FileStatus;
    if(fileStatusEnum == FileStatus.VALIDATION_INITIATED){
        return false;
    }
    return true;
}

export function isTerminalFileStatusSucceeded(fileStatus: string){
    let fileStatusEnum = fileStatus as FileStatus;
    if(isNullOrUndefined(fileStatusEnum) || fileStatusEnum == FileStatus.VALIDATION_SUCCESS || fileStatusEnum == FileStatus.NOT_VALIDATED){
        return true;
    }
    return false;
}

export function isStatusFailed(testStatus: string){
    if(testStatus === "FAILED" || testStatus === "CANCELLED"){
        return true;
    }
    return false;
}


export async function getResultObj(data:IHttpClientResponse) {
    let dataString ;
    let dataJSON ;
    try{
        dataString = await data.readBody();
        dataJSON = JSON.parse(dataString);
        return dataJSON;
    }
    catch{
        return null;
    }
}
export function getFileName(filepath:string) {
    const filename = path.basename(filepath);
    return filename;
}

export function invalidDisplayName(value : string){
    if(value.length < 2 || value.length > 50) return true;
    return false;
}

export function invalidDescription(value : string){
    if(value.length > 100) return true;
    return false;
}

export function getResourceTypeFromResourceId(resourceId:string){
    return resourceId && resourceId.split("/").length > 7 ? resourceId.split("/")[6] + "/" + resourceId.split("/")[7] : null
}

export function getResourceNameFromResourceId(resourceId:string){
    return resourceId  && resourceId.split("/").length > 8 ? resourceId.split("/")[8] : null
}

export function getResourceGroupFromResourceId(resourceId:string){
    return resourceId  && resourceId.split("/").length > 4 ? resourceId.split("/")[4] : null
}

export function getSubscriptionIdFromResourceId(resourceId:string){
    return resourceId  && resourceId.split("/").length > 2 ? resourceId.split("/")[2] : null
}

export function validateAutoStop(autoStop: any, isPipelineParam: boolean = false): ValidationModel {
    if(typeof autoStop != 'string'){
        if(isNullOrUndefined(autoStop.errorPercentage) || isNaN(autoStop.errorPercentage) || autoStop.errorPercentage > 100 || autoStop.errorPercentage < 0) {
            let errorMessage = isPipelineParam 
                                ? `The value "${autoStop.errorPercentage}" for errorPercentage of auto-stop criteria is invalid in the overrideParameters provided. The value should be valid decimal number from 0 to 100.`
                                : `The value "${autoStop.errorPercentage}" for errorPercentage of auto-stop criteria is invalid. The value should be valid decimal number from 0 to 100.`;
            return {valid : false, error : errorMessage};
        }
        if(isNullOrUndefined(autoStop.timeWindow) || isNaN(autoStop.timeWindow) || autoStop.timeWindow <= 0 || !Number.isInteger(autoStop.timeWindow)){
            let errorMessage = isPipelineParam
                                ? `The value "${autoStop.timeWindow}" for timeWindow of auto-stop criteria is invalid in the overrideParameters provided. The value should be valid integer greater than 0.`
                                : `The value "${autoStop.timeWindow}" for timeWindow of auto-stop criteria is invalid. The value should be valid integer greater than 0.`
            return {valid : false, error : errorMessage};
        }
    }
    else if(autoStop != autoStopDisable){
        let errorMessage = isPipelineParam
                            ? 'Invalid value for "autoStop" in the overrideParameters provided, for disabling auto stop use "autoStop: disable"'
                            : 'Invalid value for "autoStop", for disabling auto stop use "autoStop: disable"'
        return {valid : false, error : errorMessage};
    }
    return {valid : true, error : ""};
}

export function validateAndGetSegregatedManagedIdentities(referenceIdentities: {[key: string]: string}[], keyVaultGivenOutOfReferenceIdentities: boolean = false) : AllManagedIdentitiesSegregated {
        
    let referenceIdentityValuesUAMIMap: { [key in ReferenceIdentityKinds]: string[] } = {
        [ReferenceIdentityKinds.KeyVault]: [],
        [ReferenceIdentityKinds.Metrics]: [],
        [ReferenceIdentityKinds.Engine]: []
    };

    let referenceIdentiesSystemAssignedCount : { [key in ReferenceIdentityKinds]: number } = {
        [ReferenceIdentityKinds.KeyVault]: 0,
        [ReferenceIdentityKinds.Metrics]: 0,
        [ReferenceIdentityKinds.Engine]: 0
    }

    for (let referenceIdentity of referenceIdentities) {
        // the value has check proper check in the utils, so we can decide the Type based on the value.
        if(referenceIdentity.value) {
            referenceIdentityValuesUAMIMap[referenceIdentity.kind as ReferenceIdentityKinds].push(referenceIdentity.value);
        } else {
            referenceIdentiesSystemAssignedCount[referenceIdentity.kind as ReferenceIdentityKinds]++;
        }
    }
    
    // key-vault which needs back-compat.
    if(keyVaultGivenOutOfReferenceIdentities) {
        if(referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.KeyVault].length > 0 || referenceIdentiesSystemAssignedCount[ReferenceIdentityKinds.KeyVault] > 0) {
            throw new Error("Two KeyVault references are defined in the YAML config file. Use either the keyVaultReferenceIdentity field or the referenceIdentities section to specify the KeyVault reference identity.");
        }
        // this will be assigned above if the given is outside the refIds so no need to assign again.
    }

    for(let key in ReferenceIdentityKinds) {
        if(key != ReferenceIdentityKinds.Engine) {
            if(referenceIdentityValuesUAMIMap[key as ReferenceIdentityKinds].length > 1 || referenceIdentiesSystemAssignedCount[key as ReferenceIdentityKinds] > 1) {
                throw new Error(`Only one ${key} reference identity should be provided in the referenceIdentities array.`);
            } else if(referenceIdentityValuesUAMIMap[key as ReferenceIdentityKinds].length == 1 && referenceIdentiesSystemAssignedCount[key as ReferenceIdentityKinds] > 0) {
                throw new Error(`${key} reference identity should be either SystemAssigned or UserAssigned but not both.`);
            }
        }
    }
    
    // engines check, this can have multiple values too check is completely different.
    if(referenceIdentityValuesUAMIMap[ReferenceIdentityKinds.Engine].length > 0 && referenceIdentiesSystemAssignedCount[ReferenceIdentityKinds.Engine] > 0) {
        throw new Error("Engine reference identity should be either SystemAssigned or UserAssigned but not both.");
    } else if(referenceIdentiesSystemAssignedCount[ReferenceIdentityKinds.Engine] > 1) {
        throw new Error("Only one Engine reference identity with SystemAssigned should be provided in the referenceIdentities array.");
    }
    return {referenceIdentityValuesUAMIMap, referenceIdentiesSystemAssignedCount};
}

export function validateOverRideParameters(overRideParams: string | undefined): ValidationModel {
    try {
        if(!isNullOrUndefined(overRideParams)) {
            let overRideParamsObj : any;
            try{
                overRideParamsObj = JSON.parse(overRideParams);
            }
            catch(error) {
                return { valid: false, error:`Invalid format provided in the ${InputConstants.overRideParametersLabel} field in pipeline, provide a valid json string.` };
            };
            let unSupportedKeys : string[] = [];
            let supportedKeys : string[] = Object.keys(new OverRideParametersModel());
            Object.keys(overRideParamsObj).forEach(element => {
                if(supportedKeys.indexOf(element) == -1){
                    unSupportedKeys.push(element);
                }
            });
            if(unSupportedKeys.length) {
                const result = unSupportedKeys.map(element => `${element}`).join(", ");
                return {valid : false, error : `The ${InputConstants.overRideParametersLabel} provided has unsupported field(s) "${result}".`};
            }
            if(!isNullOrUndefined(overRideParamsObj.testId)) {
                if(typeof overRideParamsObj.testId != 'string' || invalidName(overRideParamsObj.testId)) {
                    return {valid : false, error : `The value "${overRideParamsObj.testId}" for testId provided in overrideParameters is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.`};
                }
            }
            if(!isNullOrUndefined(overRideParamsObj.displayName)) {
                if(typeof overRideParamsObj.displayName != 'string' || invalidDisplayName(overRideParamsObj.displayName)) {
                    return {valid : false, error : `The value "${overRideParamsObj.displayName}" for displayName provided in overrideParameters is invalid. Display name must be a string of length between 2 to 50.`};
                }
            }
            if(!isNullOrUndefined(overRideParamsObj.description)) {
                if(typeof overRideParamsObj.description != 'string' || invalidDescription(overRideParamsObj.description)) {
                    return {valid : false, error : `The value "${overRideParamsObj.description}" for description provided in overrideParameters is invalid. Description must be a string of length less than 100.`};
                }
            }
            if(!isNullOrUndefined(overRideParamsObj.engineInstances)) {
                if(typeof overRideParamsObj.engineInstances != 'number' || inValidEngineInstances(overRideParamsObj.engineInstances)) {
                    return {valid : false, error : `The value "${overRideParamsObj.engineInstances}" for engineInstances provided in overrideParameters is invalid. The value should be an integer between 1 and 400.`};
                }
            }
            if(!isNullOrUndefined(overRideParamsObj.autoStop)) {
                let validation = validateAutoStop(overRideParamsObj.autoStop, true);
                if(validation.valid == false){
                    return validation;
                }
            }
        }
    }
    catch (error) {
        return {valid: false, error: (error ?? '').toString()};
    }
    return {valid : true, error : ""};
}

export function validateOutputParametervariableName(outputVarName: string): ValidationModel {
    if(isNullOrUndefined(outputVarName) || typeof outputVarName != 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(outputVarName)){
        return { valid: false, error: `Invalid output variable name '${outputVarName}'. Use only letters, numbers, and underscores.`};
    }
    return {valid : true, error : ""};
}

export function validateUrl(url:string) 
{
    var r = new RegExp(/(http|https):\/\/.*\/secrets\/.+$/);
    return r.test(url);
}
export function validateUrlcert(url:string) 
{
    var r = new RegExp(/(http|https):\/\/.*\/certificates\/.+$/);
    return r.test(url);
}

export function invalidName(value:string) 
{
    if(value.length < 2 || value.length > 50) return true;
    var r = new RegExp(/[^a-z0-9_-]+/);
    return r.test(value);
}

export function inValidEngineInstances(engines : number) : boolean{
    if(engines > 400 || engines < 1){
        return true;
    }
    return false;
}

export function getDefaultTestName()
{
    const a = (new Date(Date.now())).toLocaleString()
    const b = a.split(", ")
    const c = a.split(" ")
    return "Test_"+b[0]+"_"+c[1]+c[2]
}

export function getDefaultTestRunName()
{
    const a = (new Date(Date.now())).toLocaleString()
    const b = a.split(", ")
    const c = a.split(" ")
    return "TestRun_"+b[0]+"_"+c[1]+c[2]
}

export function getDefaultRunDescription()
{
    const pipelineName = process.env.GITHUB_WORKFLOW || "Unknown Pipeline";
    return "Started using GH workflows" + (pipelineName ? "-" + pipelineName : "");
}

export function validateTestRunParamsFromPipeline(runTimeParams: RunTimeParams){    
    if(runTimeParams.runDisplayName && invalidDisplayName(runTimeParams.runDisplayName))
        throw new Error("Invalid test run name. Test run name must be between 2 to 50 characters.");
    if(runTimeParams.runDescription && invalidDescription(runTimeParams.runDescription))
        throw new Error("Invalid test run description. Test run description must be less than 100 characters.")
}

export function getAllFileErrors(testObj:TestModel | null): { [key: string]: string } {
    let allArtifacts:any[] = [];
    let additionalArtifacts = testObj?.inputArtifacts?.additionalFileInfo;
    additionalArtifacts && (allArtifacts = allArtifacts.concat(additionalArtifacts.filter((artifact:any) => artifact !== null && artifact !== undefined)));

    let testScript = testObj?.inputArtifacts?.testScriptFileInfo;
    testScript && allArtifacts.push(testScript);

    let configFile = testObj?.inputArtifacts?.configFileInfo;
    configFile && allArtifacts.push(configFile);

    let userProperties = testObj?.inputArtifacts?.userPropFileInfo;
    userProperties && allArtifacts.push(userProperties);

    let zipFile = testObj?.inputArtifacts?.inputArtifactsZipFileInfo;
    zipFile && allArtifacts.push(zipFile);

    let urlFile = testObj?.inputArtifacts?.urlTestConfigFileInfo;
    urlFile && allArtifacts.push(urlFile);

    let fileErrors: { [key: string]: string } = {};
    for (const file of allArtifacts) {
        if (file.validationStatus === "VALIDATION_FAILURE") {
            fileErrors[file.fileName] = file.validationFailureDetails;
        }
    }

    return fileErrors;
}
