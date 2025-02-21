import { IHttpClientResponse } from 'typed-rest-client/Interfaces';
const { v4: uuidv4 } = require('uuid');
import { isNull, isNullOrUndefined } from 'util';
import { defaultYaml } from './constants';
import * as EngineUtil from './engine/Util';
import { BaseLoadTestFrameworkModel } from './engine/BaseLoadTestFrameworkModel';
import { TestKind } from "./engine/TestKind";
import { PassFailMetric, Statistics, TestRunArtifacts, TestRunModel, TestModel, ManagedIdentityTypeForAPI } from './PayloadModels';
import { RunTimeParams, ValidAggregateList, ValidConditionList, ManagedIdentityType, PassFailCount, ReferenceIdentityKinds, AllManagedIdentitiesSegregated, ValidationModel } from './UtilModels';

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

export function ErrorCorrection(result : IHttpClientResponse){
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

export function isStatusFailed(testStatus: string){
    if(testStatus === "FAILED" || testStatus === "CANCELLED"){
        return true;
    }
    return false;
}

export function validCriteria(data:any) {
    switch(data.clientMetric) {
        case "response_time_ms":
            return validResponseTimeCriteria(data);
        case "requests_per_sec":
            return validRequestsPerSecondCriteria(data);
        case "requests":
            return validRequestsCriteria(data);
        case "latency":
            return validLatencyCriteria(data);
        case "error":
            return validErrorCriteria(data);
        default:
            return false;
    }
}

function validResponseTimeCriteria(data:any)  {
    return !(!ValidAggregateList['response_time_ms'].includes(data.aggregate) || !ValidConditionList['response_time_ms'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}
function validRequestsPerSecondCriteria(data:any)  {
    return !(!ValidAggregateList['requests_per_sec'].includes(data.aggregate) || !ValidConditionList['requests_per_sec'].includes(data.condition)
        || data.action!= "continue");
}
function validRequestsCriteria(data:any)  {
    return !(!ValidAggregateList['requests'].includes(data.aggregate) || !ValidConditionList['requests'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}
function validLatencyCriteria(data:any)  {
    return !(!ValidAggregateList['latency'].includes(data.aggregate) || !ValidConditionList['latency'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}
function validErrorCriteria(data:any)  {
    return !(!ValidAggregateList['error'].includes(data.aggregate) || !ValidConditionList['error'].includes(data.condition)
        || Number(data.value)<0 || Number(data.value)>100 || data.action!= "continue");
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

function isDictionary(variable: any): variable is { [key: string]: any } {
    return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}

function invalidName(value:string) 
{
    if(value.length < 2 || value.length > 50) return true;
    var r = new RegExp(/[^a-z0-9_-]+/);
    return r.test(value);
}

export function invalidDisplayName(value : string){
    if(value.length < 2 || value.length > 50) return true;
    return false;
}

export function invalidDescription(value : string){
    if(value.length > 100) return true;
    return false;
}

function isInValidSubnet(uri: string): boolean {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.Network\/virtualNetworks\/[a-zA-Z0-9._-]+\/subnets\/[a-zA-Z0-9._-]+$/i;
    return !(pattern.test(uri));
}

function isInvalidManagedIdentityId(uri: string): boolean {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.ManagedIdentity\/userAssignedIdentities\/[a-zA-Z0-9._-]+$/i;

    return !(pattern.test(uri));
}

function isValidReferenceIdentityKind(value: string): value is ManagedIdentityType {
    return Object.values(ReferenceIdentityKinds).includes(value as ReferenceIdentityKinds);
}


function isValidTestKind(value: string): value is TestKind {
    return Object.values(TestKind).includes(value as TestKind);
}

function isValidManagedIdentityType(value: string): value is ManagedIdentityType {
    return Object.values(ManagedIdentityType).includes(value as ManagedIdentityType);
}

function isArrayOfStrings(variable: any): variable is string[] {
    return Array.isArray(variable) && variable.every((item) => typeof item === 'string');
}

function isInvalidString(variable: any, allowNull : boolean = false): variable is string[] {
    if(allowNull){
        return !isNullOrUndefined(variable) && (typeof variable != 'string' || variable == "");
    }
    return isNullOrUndefined(variable) || typeof variable != 'string' || variable == "";
}

function inValidEngineInstances(engines : number) : boolean{
    if(engines > 400 || engines < 1){
        return true;
    }
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

function isValidGUID(guid: string): boolean {
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return guidRegex.test(guid);
}

export function checkValidityYaml(givenYaml : any) : {valid : boolean, error : string} {
    if(!isDictionary(givenYaml)) {
        return {valid : false,error :`Invalid YAML syntax.`};
    }
    let unSupportedKeys : string[] = [];
    let supportedKeys : string[] = Object.keys(defaultYaml);
    Object.keys(givenYaml).forEach(element => {
        if(supportedKeys.indexOf(element) == -1){
            unSupportedKeys.push(element);
        }
    });
    if(unSupportedKeys.length) {
        const result = unSupportedKeys.map(element => `${element}`).join(", ");
        return {valid : false, error : `The YAML file provided has unsupported field(s) "${result}".`};
    }
    if(isNullOrUndefined(givenYaml.testName) && isNullOrUndefined(givenYaml.testId)){
        return {valid : false, error : "The required field testId is missing in the load test YAML file."};
    }
    let testId = '';
    if(!isNullOrUndefined(givenYaml.testName)){
        testId = givenYaml.testName;
    }
    if(!isNullOrUndefined(givenYaml.testId)){
        testId = givenYaml.testId;
    }
    testId = testId.toLowerCase();
    if(typeof(testId) != "string" || invalidName(testId)){
        return {valid : false, error : `The value "${testId}" for testId is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.`};
    }
    if(givenYaml.displayName && (typeof givenYaml.displayName != 'string' || invalidDisplayName(givenYaml.displayName))){
        return {valid : false, error : `The value "${givenYaml.displayName}" for displayName is invalid. Display name must be a string of length between 2 to 50.`};
    }
    if(givenYaml.description && (typeof givenYaml.description != 'string' || invalidDescription(givenYaml.description))){
        return {valid : false, error : `The value "${givenYaml.description}" for description is invalid. Description must be a string of length less than 100.`};
    }
    if(isNullOrUndefined(givenYaml.testPlan)){
        return {valid : false, error : "The required field testPlan is missing in the load test YAML file."};
    }
    if(givenYaml.engineInstances && (isNaN(givenYaml.engineInstances) || inValidEngineInstances(givenYaml.engineInstances))){
        return {valid : false, error : `The value "${givenYaml.engineInstances}" for engineInstances is invalid. The value should be an integer between 1 and 400.`};
    }
    
    let kind : TestKind = givenYaml.testType ?? TestKind.JMX;
    
    if(!isValidTestKind(kind)){
        return {valid : false, error : `The value "${kind}" for testType is invalid. Acceptable values are ${EngineUtil.Resources.Strings.allFrameworksFriendly}.`};
    }
    
    let framework : BaseLoadTestFrameworkModel = EngineUtil.getLoadTestFrameworkModelFromKind(kind);
    if(givenYaml.testType as TestKind == TestKind.URL){
        if(!checkFileType(givenYaml.testPlan,'json')) {
            return {valid : false, error : "The testPlan for a URL test should of type \"json\"."};
        }
    }
    else if(!checkFileType(givenYaml.testPlan, framework.testScriptFileExtension)) {
        return {valid : false, error : `The testPlan for a ${kind} test should of type "${framework.testScriptFileExtension}".`};
    }
    if(givenYaml.subnetId && (typeof givenYaml.subnetId!= 'string' || isInValidSubnet(givenYaml.subnetId))){
        return {valid : false, error : `The value "${givenYaml.subnetId}" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".`};
    }
    if(givenYaml.keyVaultReferenceIdentity && (typeof givenYaml.keyVaultReferenceIdentity!= 'string' || isInvalidManagedIdentityId(givenYaml.keyVaultReferenceIdentity))){
        return {valid : false, error : `The value "${givenYaml.keyVaultReferenceIdentity}" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".`};
    }
    if(givenYaml.keyVaultReferenceIdentityType != undefined && givenYaml.keyVaultReferenceIdentityType != null && !isValidManagedIdentityType(givenYaml.keyVaultReferenceIdentityType)){
        return {valid : false, error : `The value "${givenYaml.keyVaultReferenceIdentityType}" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
    }
    if(!isNullOrUndefined(givenYaml.referenceIdentities)) {
        if(!Array.isArray(givenYaml.referenceIdentities)){
            return {valid : false, error : `The value "${givenYaml.referenceIdentities.toString()}" for referenceIdentities is invalid. Provide a valid list of reference identities.`};
        }
        let result = validateReferenceIdentities(givenYaml.referenceIdentities);
        if(result?.valid == false){
            return result;
        }
        try {
            if(givenYaml.keyVaultReferenceIdentityType || givenYaml.keyVaultReferenceIdentity){
                validateAndGetSegregatedManagedIdentities(givenYaml.referenceIdentities as Array<{[key: string] : string}>, true);
            } else {
                validateAndGetSegregatedManagedIdentities(givenYaml.referenceIdentities as Array<{[key: string] : string}>);
            }
        } catch (error : any) {
            return {valid : false, error : error.message};
        }
    }
    if(!isNullOrUndefined(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == ManagedIdentityType.SystemAssigned){
        return {valid : false, error : `The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.`};
    }
    if(isNullOrUndefined(givenYaml.keyVaultReferenceIdentity) && givenYaml.keyVaultReferenceIdentityType == ManagedIdentityType.UserAssigned){
        return {valid : false, error : `"The value for 'keyVaultReferenceIdentity' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'keyVaultReferenceIdentity'."`};
    }
    if(givenYaml.publicIPDisabled && typeof givenYaml.publicIPDisabled!= 'boolean'){
        return {valid : false, error : `The value "${givenYaml.publicIPDisabled}" for publicIPDisabled is invalid. The value should be either true or false.`};
    }
    if(givenYaml.publicIPDisabled && isNullOrUndefined(givenYaml.subnetId)){
        return {valid : false, error : `Public IP deployment can only be disabled for tests against private endpoints. For public endpoints, set publicIPDisabled to False.`}
    }
    if(givenYaml.configurationFiles && !isArrayOfStrings(givenYaml.configurationFiles)){
        return {valid : false, error : `The value "${givenYaml.configurationFiles}" for configurationFiles is invalid. Provide a valid list of strings.`};
    }
    if(givenYaml.zipArtifacts && !isArrayOfStrings(givenYaml.zipArtifacts)){
        return {valid : false, error : `The value "${givenYaml.zipArtifacts}" for zipArtifacts is invalid. Provide a valid list of strings.`};
    }
    if(givenYaml.splitAllCSVs && typeof givenYaml.splitAllCSVs!= 'boolean'){
        return {valid : false, error : `The value "${givenYaml.splitAllCSVs}" for splitAllCSVs is invalid. The value should be either true or false`};
    }
    if(givenYaml.properties != undefined && givenYaml.properties.userPropertyFile != undefined){
        if(isNull(givenYaml.properties.userPropertyFile) || typeof givenYaml.properties.userPropertyFile != 'string' || !checkFileTypes(givenYaml.properties.userPropertyFile, framework.userPropertyFileExtensions)){
            return {valid : false, error : `The value "${givenYaml.properties.userPropertyFile}" for userPropertyFile is invalid. Provide a valid file path of type ${framework.ClientResources.userPropertyFileExtensionsFriendly}. Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`}
        }
    }
    if(givenYaml.appComponents) {
        if(!Array.isArray(givenYaml.appComponents)){
            return {valid : false, error : `The value "${givenYaml.appComponents}" for appComponents is invalid. Provide a valid list of application components.`};
        }
        let validationAppComponents = validateAppComponentAndServerComponents(givenYaml.appComponents);
        if(validationAppComponents.valid == false){
            return validationAppComponents;
        }
    }
    if(givenYaml.autoStop){
        if(typeof givenYaml.autoStop != 'string'){
            if(isNullOrUndefined(givenYaml.autoStop.errorPercentage) || isNaN(givenYaml.autoStop.errorPercentage) || givenYaml.autoStop.errorPercentage > 100 || givenYaml.autoStop.errorPercentage < 0) {
                return {valid : false, error : `The value "${givenYaml.autoStop.errorPercentage}" for errorPercentage of auto-stop criteria is invalid. The value should be valid decimal number from 0 to 100.`};
            }
            if(isNullOrUndefined(givenYaml.autoStop.timeWindow) || isNaN(givenYaml.autoStop.timeWindow) || givenYaml.autoStop.timeWindow <= 0 || !Number.isInteger(givenYaml.autoStop.timeWindow)){
                return {valid : false, error : `The value "${givenYaml.autoStop.timeWindow}" for timeWindow of auto-stop criteria is invalid. The value should be valid integer greater than 0.`};
            }
        }
        else if(givenYaml.autoStop != "disable"){
            return {valid : false, error : 'Invalid value for "autoStop", for disabling auto stop use "autoStop: disable"'};
        }
    }
    if(givenYaml.regionalLoadTestConfig){
        if(!Array.isArray(givenYaml.regionalLoadTestConfig)){
            return {valid : false, error : `The value "${givenYaml.regionalLoadTestConfig}" for regionalLoadTestConfig is invalid. Provide a valid list of region configuration for Multi-region load test.`};
        }
        
        if(givenYaml.regionalLoadTestConfig.length < 2){
            return {valid : false, error : `Multi-region load tests should contain a minimum of 2 geographic regions in the configuration.`};
        }
        
        var totalEngineCount = 0;
        for(let i = 0; i < givenYaml.regionalLoadTestConfig.length; i++){
            if(isNullOrUndefined(givenYaml.regionalLoadTestConfig[i].region) || typeof givenYaml.regionalLoadTestConfig[i].region != 'string' || givenYaml.regionalLoadTestConfig[i].region == ""){
                return {valid : false, error : `The value "${givenYaml.regionalLoadTestConfig[i].region}" for region in regionalLoadTestConfig is invalid. Provide a valid string.`};
            }
            if(isNullOrUndefined(givenYaml.regionalLoadTestConfig[i].engineInstances) || isNaN(givenYaml.regionalLoadTestConfig[i].engineInstances) || inValidEngineInstances(givenYaml.regionalLoadTestConfig[i].engineInstances)){
                return {valid : false, error : `The value "${givenYaml.regionalLoadTestConfig[i].engineInstances}" for engineInstances in regionalLoadTestConfig is invalid. The value should be an integer between 1 and 400.`};
            }
            totalEngineCount += givenYaml.regionalLoadTestConfig[i].engineInstances;
        }
        let engineInstances = givenYaml.engineInstances ?? 1;
        if(totalEngineCount != givenYaml.engineInstances){
            return {valid : false, error : `The sum of engineInstances in regionalLoadTestConfig should be equal to the value of totalEngineInstances "${engineInstances}" in the test configuration.`};
        }
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
            throw new Error("KeyVault reference identity should not be provided in the referenceIdentities array if keyVaultReferenceIdentity is provided.");
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
function validateAppComponentAndServerComponents(appComponents: Array<any>) : ValidationModel {
    let appComponentsParsed = appComponents;
    for(let i = 0; i < appComponentsParsed.length; i++){
        if(!isDictionary(appComponentsParsed[i])){
            return {valid : false, error : `The value "${appComponentsParsed[i].toString()}" for AppComponents in the index "${i}" is invalid. Provide a valid dictionary.`};
        }
        let resourceId = appComponentsParsed[i].resourceId;
        if(isInvalidString(resourceId)){
            return {valid : false, error : `The value "${appComponentsParsed[i].resourceId}" for resourceId in appComponents is invalid. Provide a valid resourceId.`};
        }
        resourceId = resourceId.toLowerCase();
        let subscriptionId = getSubscriptionIdFromResourceId(resourceId);
        let resourceType = getResourceTypeFromResourceId(resourceId);
        let name = getResourceNameFromResourceId(resourceId);
        let resourceGroup = getResourceGroupFromResourceId(resourceId);
        if(isNullOrUndefined(resourceGroup) || isNullOrUndefined(subscriptionId) 
            || isNullOrUndefined(resourceType) || isNullOrUndefined(name) 
            || !isValidGUID(subscriptionId)){
            return {valid : false, error : `The value "${resourceId}" for resourceId in appComponents is invalid. Provide a valid resourceId.`};
        }
        if(isInvalidString(appComponentsParsed[i].kind, true)){
            return {valid : false, error : `The value "${appComponentsParsed[i].kind?.toString()}" for kind in appComponents is invalid. Provide a valid string.`};
        }
        if(isInvalidString(appComponentsParsed[i].resourceName, true)){
            return {valid : false, error : `The value "${appComponentsParsed[i].resourceName?.toString()}" for resourceName in appComponents is invalid. Provide a valid string.`};
        }
        let resourceName = appComponentsParsed[i].resourceName || name;
        if(!isNullOrUndefined(appComponentsParsed[i].metrics)) {
            let metrics = appComponentsParsed[i].metrics;
            if(!Array.isArray(metrics)){
                return {valid : false, error : `The value "${metrics?.toString()}" for metrics in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid list of metrics.`};
            }
            for(let metric of metrics){
                if(!isDictionary(metric)){
                    return {valid : false, error : `The value "${metric?.toString()}" for metrics in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid dictionary.`};
                }
                if(metric && isInvalidString(metric.name)){
                    return {valid : false, error : `The value "${metric.name?.toString()}" for name in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.`};
                }
                if(isInvalidString(metric.aggregation)){
                    return {valid : false, error : `The value "${metric.aggregation?.toString()}" for aggregation in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.`};
                }
                if(isInvalidString(metric.namespace, true)){
                    return {valid : false, error : `The value "${metric.namespace?.toString()}" for namespace in the appComponent with resourceName "${resourceName}" is invalid. Provide a valid string.`};
                }
            }
        } else {
            console.log(`Metrics not provided for the appComponent "${resourceName}", default metrics will be enabled for the same.`);
        }
    }
    return {valid : true, error : ""};
}

function validateReferenceIdentities(referenceIdentities: Array<any>) : {valid : boolean, error : string} {
    for(let referenceIdentity of referenceIdentities){        
        if(!isDictionary(referenceIdentity)){
            return {valid : false, error : `The value "${referenceIdentity.toString()}" for referenceIdentities is invalid. Provide a valid dictionary with kind, value and type.`};
        }
        if(referenceIdentity.value != undefined && typeof referenceIdentity.value != 'string'){
            return {valid : false, error : `The value "${referenceIdentity.value.toString()}" for id in referenceIdentities is invalid. Provide a valid string.`};
        }
        if(referenceIdentity.type != undefined && typeof referenceIdentity.type != 'string'){
            return {valid : false, error : `The value "${referenceIdentity.type.toString()}" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
        }
        if(!isValidReferenceIdentityKind(referenceIdentity.kind)){
            return {valid : false, error : `The value "${referenceIdentity.kind}" for kind in referenceIdentity is invalid. Allowed values are 'Metrics', 'Keyvault' and 'Engine'.`};
        }
        if(referenceIdentity.type && !isValidManagedIdentityType(referenceIdentity.type)){
            return {valid : false, error : `The value "${referenceIdentity.type}" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
        }
        if(!isNullOrUndefined(referenceIdentity.value) && referenceIdentity.type == ManagedIdentityType.SystemAssigned){
            return {valid : false, error : `The "reference identity value" should omitted or set to null when using the "SystemAssigned" identity type.`};
        }
        if(isNullOrUndefined(referenceIdentity.value) && referenceIdentity.type == ManagedIdentityType.UserAssigned){
            return {valid : false, error : `The value for 'referenceIdentity value' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'reference identity value'.`};
        }
        if(referenceIdentity.value && isInvalidManagedIdentityId(referenceIdentity.value)){
            return {valid : false, error : `The value "${referenceIdentity.value}" for reference identity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".`};
        }
    }
    return {valid : true, error : ""};
}

/*
    ado takes the full pf criteria as a string after parsing the string into proper data model, 
*/
export function getPassFailCriteriaFromString(passFailCriteria: (string | {[key: string]: string})[]): { [key: string]: number } {
    let failureCriteriaValue : {[key: string] : number} = {};
    passFailCriteria.forEach(criteria => {
        let criteriaString = criteria as string;
        let data = {
            aggregate: "",
            clientMetric: "",
            condition: "",
            value: "",
            requestName: "",
            action: "",
        }
        if(typeof criteria !== "string"){
            let request = Object.keys(criteria)[0]
            data.requestName = request;
            criteriaString = criteria[request]
        }
        let tempStr: string = "";
        
        for(let i=0; i<criteriaString.length; i++){
            if(criteriaString[i] == '('){
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if(criteriaString[i] == ')'){
                data.clientMetric = tempStr;
                tempStr = "";
            }
            else if(criteriaString[i] == ','){
                data.condition = tempStr.substring(0, indexOfFirstDigit(tempStr)).trim();
                data.value = tempStr.substr(indexOfFirstDigit(tempStr)).trim();
                tempStr = "";
            }
            else{
                tempStr += criteriaString[i];
            }
        }
        if(criteriaString.indexOf(',') != -1){
            data.action = tempStr.trim()
        } 
        else{
            data.condition = tempStr.substring(0, indexOfFirstDigit(tempStr)).trim();
            data.value = tempStr.substr(indexOfFirstDigit(tempStr)).trim();
        }
        ValidateCriteriaAndConvertToWorkingStringModel(data, failureCriteriaValue);
    });
    return failureCriteriaValue;
}
/*
    ado takes the full pf criteria as a string after parsing the string into proper data model, 
    this is to avoid duplicates of the data by keeping the full aggrregated metric 
    as a key and the values will be set in this function to use it further
*/
export function ValidateCriteriaAndConvertToWorkingStringModel(data: any, failureCriteriaValue : {[key: string] : number}) {

    if(data.action == "")
        data.action = "continue"
    data.value = removeUnits(data.value);
    if(!validCriteria(data)) 
        throw new Error("Invalid Failure Criteria");
    let key: string = data.clientMetric+' '+data.aggregate+' '+data.condition+' '+data.action;
    if(data.requestName != ""){
        key = key + ' ' + data.requestName;
    }
    let val: number = parseInt(data.value);
    let currVal = val;
    
    if(failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if(data.condition == '>'){
        failureCriteriaValue[key] = (val<currVal) ? val : currVal;
    }
    else{
        failureCriteriaValue[key] = (val>currVal) ? val : currVal;
    }
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
    return "Started using GitHub Actions"
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
