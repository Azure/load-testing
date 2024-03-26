import * as fs from 'fs';
var path = require('path');
var AdmZip = require("adm-zip");
const { v4: uuidv4 } = require('uuid');
import * as core from '@actions/core'
import httpc = require('typed-rest-client/HttpClient');
import internal = require('stream');
const httpClient: httpc.HttpClient = new httpc.HttpClient('MALT-GHACTION');
import { IHttpClientResponse, IHeaders } from 'typed-rest-client/Interfaces';
import * as map from "./mappers";
import { Readable } from 'stream';
import { isNull, isUndefined, isNullOrUndefined } from 'util';
import { defaultYaml } from './constants';

const validAggregateList = {
    'response_time_ms': ['avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'],
    'requests_per_sec': ['avg'],
    'requests': ['count'],
    'latency': ['avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'],
    'error': ['percentage']
}

export enum TestKind {
    URL = "URL",
    JMX = "JMX" // default
}
  
const validConditionList = {
    'response_time_ms': ['>', '<'],
    'requests_per_sec': ['>', '<'],
    'requests': ['>', '<'],
    'latency': ['>', '<'],
    'error': ['>']
}
export module apiConstants {
    export const tm2023Version = '2023-04-01-preview';
    export const tm2022Version = '2022-11-01';
    export const cp2022Version = '2022-12-01'
}
export enum ManagedIdentityType {
    SystemAssigned = "SystemAssigned",
    UserAssigned = "UserAssigned",
}

export function uploadFileData(filepath: string) {
    try {
        let filedata: Buffer = fs.readFileSync(filepath);
        const readable = new Readable();
        readable._read = () => {};
        readable.push(filedata);
        readable.push(null);
        return readable;
    } catch (err: any) {
        err.message = "File not found " + filepath;
        throw new Error(err.message);
    }
}

const correlationHeader = 'x-ms-correlation-request-id'
export async function httpClientRetries(urlSuffix : string, header : IHeaders, method : 'get' | 'del' | 'patch' | 'put', retries : number = 1,data : string, isUploadCall : boolean = true ) : Promise<IHttpClientResponse>{
    let httpResponse : IHttpClientResponse;
    try {
        let correlationId = `gh-actions-${getUniqueId()}`;
        header[correlationHeader] = correlationId; // even if we put console.debug its printing along with the logs, so lets just go ahead with the differentiation with gh-actions, so we can search the timeframe for gh-actions in correlationid and resource filter.
        if(method == 'get'){
            httpResponse = await httpClient.get(urlSuffix, header);
        }
        else if(method == 'del'){
            httpResponse = await httpClient.del(urlSuffix, header); 
        }
        else if(method == 'put' && isUploadCall){
            let fileContent = uploadFileData(data);
            httpResponse = await httpClient.request(method,urlSuffix, fileContent, header);
        }
        else{
            httpResponse = await httpClient.request(method,urlSuffix, data, header);
        }
        if(httpResponse.message.statusCode!= undefined && httpResponse.message.statusCode >= 300){
            core.debug(`correlation id : ${correlationId}`);
        }
        if(httpResponse.message.statusCode!=undefined && [408,429,502,503,504].includes(httpResponse.message.statusCode)){
            let err = await getResultObj(httpResponse);
            throw {message : (err && err.error && err.error.message) ? err.error.message : ErrorCorrection(httpResponse)}; // throwing as message to catch it as err.message
        }
        return httpResponse;
    }
    catch(err:any){
        if(retries){
            let sleeptime = (5-retries)*1000 + Math.floor(Math.random() * 5001);
            await sleep(sleeptime);
            console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime/1000} seconds`);
            return httpClientRetries(urlSuffix,header,method,retries-1,data);
        }
        else
            throw new Error(`Operation did not succeed after 3 retries. Pipeline failed with error : ${err.message}`);
    }
}
export function checkFileType(filePath: string, fileExtToValidate: string): boolean{
    if(isNullOrUndefined(filePath)){
        return false;
    }
    let split = filePath.split('.');
    return split[split.length-1].toLowerCase() == fileExtToValidate.toLowerCase();
}
export async function printTestDuration(vusers:string, startTime:Date, endTime : Date, testStatus : string) 
{
    console.log("TestRun completed\n");
    console.log("-------------------Summary ---------------");
    console.log("TestRun start time: "+ startTime);
    console.log("TestRun end time: "+ endTime);
    console.log("Virtual Users: "+ vusers);
    console.log(`TestStatus: ${testStatus} \n`);
    return;
}
export function printCriteria(criteria:any) {
    if(Object.keys(criteria).length == 0)
        return;
    printTestResult(criteria);
    console.log("Criteria\t\t\t\t\t :Actual Value\t        Result");
    for(var key in criteria) {
        var metric = criteria[key];
        var str = metric.aggregate+"("+metric.clientMetric+") "+ metric.condition+ ' '+metric.value;
        if(metric.requestName != null){
            str = metric.requestName + ": " + str;
        }
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
function printTestResult(criteria:any) {
    let pass = 0; 
    let fail = 0;
    for(var key in criteria) {
        if(criteria[key].result == "passed")
            pass++;
        else if(criteria[key].result == "failed")
            fail++;
    }
    console.log("-------------------Test Criteria ---------------");
    console.log("Results\t\t\t :"+pass+" Pass  "+fail+" Fail\n");
}
export async function getResultsFile(response:any) 
{
    try {
        const filePath = path.join('loadTest','results.zip');
        const file: NodeJS.WritableStream = fs.createWriteStream(filePath);
        
        return new Promise((resolve, reject) => {
            file.on("error", (err) => reject(err));
            const stream = response.message.pipe(file);
            stream.on("close", () => {
                try { resolve(filePath); } catch (err) {
                    reject(err);
                }
            });
        });
    }
    catch(err:any) {
        err.message = "Error in fetching the results of the testRun";
        throw new Error(err);
    }
}
export async function printClientMetrics(obj:any) {
    if(Object.keys(obj).length == 0)
        return;
    console.log("------------------Client-side metrics------------\n");
        for(var key in obj) {
            if(key != "Total")
                printMetrics(obj[key]);
        }
}
export async function getStatisticsFile(obj:any) {
    let target = path.join('dropResults',"reports");
    try 
    {
        var filepath = path.join('dropResults','results.zip');
        var zip = new AdmZip(filepath);
        zip.extractAllTo(target);
        let stats = path.join(target,"statistics.json");
        let json = fs.readFileSync(stats, 'utf8');
        var obj = JSON.parse(json);

        console.log("------------------Client-side metrics------------\n");
        for(var key in obj) {
            if(key != "Total")
                printMetrics(obj[key]);
        }
        deleteFile(target);
    } 
    catch(err:any) {
        err.message = "Error in fetching the client-side metrics of the testRun";
        throw new Error(err);
    }
}

function printMetrics(data:any) {
    console.log(data.transaction);
    console.log("response time \t\t : avg="+getAbsVal(data.meanResTime)+"ms min="+getAbsVal(data.minResTime)+"ms med="+getAbsVal(data.medianResTime)+"ms max="+getAbsVal(data.maxResTime)+"ms p(90)="+getAbsVal(data.pct1ResTime)+"ms p(95)="+getAbsVal(data.pct2ResTime)+"ms p(99)="+getAbsVal(data.pct3ResTime)+"ms");
    console.log("requests per sec \t : avg="+getAbsVal(data.throughput));
    console.log("total requests \t\t : "+data.sampleCount)
    console.log("total errors \t\t : " + data.errorCount)
    console.log("total error rate \t : "+data.errorPct + "\n");
}

function getAbsVal(data:any) {
    data = data.toString();
    var index = data.indexOf(".");
    if(index != -1)
        data =  data.substr(0,index);
    return data;
}

export function sleep(ms:any) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}  

export function getUniqueId() {
    return uuidv4().toString();
}
function isDictionary(variable: any): variable is { [key: string]: any } {
    return typeof variable === 'object' && variable !== null && !Array.isArray(variable);
}
export function invalidName(value:string) 
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
function isInValidKVId(uri: string): boolean {
    const pattern = /^\/subscriptions\/[a-f0-9-]+\/resourceGroups\/[a-zA-Z0-9\u0080-\uFFFF()._-]+\/providers\/Microsoft\.ManagedIdentity\/userAssignedIdentities\/[a-zA-Z0-9._-]+$/i;

    return !(pattern.test(uri));
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
function inValidEngineInstances(engines : number) : boolean{
    if(engines > 400 || engines < 1){
        return true;
    }
    return false;
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
        return {valid : false, error : `The value "${kind}" for testType is invalid. Acceptable values are are URL and JMX.`};
    }
    if(givenYaml.testType as TestKind == TestKind.URL){
        if(!checkFileType(givenYaml.testPlan,'json')) {
            return {valid : false, error : "The testPlan for a URL test should of type JSON."};
        }
    }
    else if(!checkFileType(givenYaml.testPlan,'jmx')) {
        return {valid : false, error : "The testPlan for a JMX test should of type JMX."};
    }
    if(givenYaml.subnetId && (typeof givenYaml.subnetId!= 'string' || isInValidSubnet(givenYaml.subnetId))){
        return {valid : false, error : `The value "${givenYaml.subnetId}" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".`};
    }
    if(givenYaml.keyVaultReferenceIdentity && (typeof givenYaml.keyVaultReferenceIdentity!= 'string' || isInValidKVId(givenYaml.keyVaultReferenceIdentity))){
        return {valid : false, error : `The value "${givenYaml.keyVaultReferenceIdentity}" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".`};
    }
    if(givenYaml.keyVaultReferenceIdentityType != undefined && givenYaml.keyVaultReferenceIdentityType != null && !isValidManagedIdentityType(givenYaml.keyVaultReferenceIdentityType)){
        return {valid : false, error : `The value "${givenYaml.keyVaultReferenceIdentityType}" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`};
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
        if(isNull(givenYaml.properties.userPropertyFile) || typeof givenYaml.properties.userPropertyFile != 'string' || !checkFileType(givenYaml.properties.userPropertyFile, 'properties')){
            return {valid : false, error : `The value "${givenYaml.properties.userPropertyFile}" for userPropertyFile is invalid. Provide a valid file path of type ".properties". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`}
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
    return {valid : true, error : ""};
}

export function getResultFolder(testArtifacts:any) {
    if(testArtifacts == null || testArtifacts.outputArtifacts == null)
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return (outputurl.resultFileInfo != null)? outputurl.resultFileInfo.url: null;
}
export function deleteFile(foldername:string) 
{
    if (fs.existsSync(foldername)) 
    {
        fs.readdirSync(foldername).forEach((file, index) => {
            const curPath = path.join(foldername, file);
            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFile(curPath);
            } else {
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(foldername);
    }
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
    if(testStatus === "DONE" || testStatus === "FAILED" || testStatus === "CANCELLED"){
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
    return !(!validAggregateList['response_time_ms'].includes(data.aggregate) || !validConditionList['response_time_ms'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}

function validRequestsPerSecondCriteria(data:any)  {
    return !(!validAggregateList['requests_per_sec'].includes(data.aggregate) || !validConditionList['requests_per_sec'].includes(data.condition)
        || data.action!= "continue");
}
function validRequestsCriteria(data:any)  {
    return !(!validAggregateList['requests'].includes(data.aggregate) || !validConditionList['requests'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}
function validLatencyCriteria(data:any)  {
    return !(!validAggregateList['latency'].includes(data.aggregate) || !validConditionList['latency'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}
function validErrorCriteria(data:any)  {
    return !(!validAggregateList['error'].includes(data.aggregate) || !validConditionList['error'].includes(data.condition)
        || Number(data.value)<0 || Number(data.value)>100 || data.action!= "continue");
}
export async function getResultObj(data:any) {
    var dataString ;
    var dataJSON ;
    try{
        dataString = await data.readBody();
        dataJSON = JSON.parse(dataString);
        return dataJSON;
    }
    catch{
        return null;
    }
}
export function ErrorCorrection(result : IHttpClientResponse){
    return "Unable to fetch the response. Please re-run or contact support if the issue persists. " + "Status code: " + result.message.statusCode ;
}