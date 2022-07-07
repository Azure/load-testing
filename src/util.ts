import * as fs from 'fs';
var path = require('path');
var AdmZip = require("adm-zip");
const { v4: uuidv4 } = require('uuid');

const validAggregateList = {
    'response_time_ms': ['avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'],
    'requests_per_sec': ['avg'],
    'requests': ['count'],
    'latency': ['avg', 'min', 'max', 'p50', 'p90', 'p95', 'p99'],
    'error': ['percentage']
}

const validConditionList = {
    'response_time_ms': ['>', '<'],
    'requests_per_sec': ['>', '<'],
    'requests': ['>', '<'],
    'latency': ['>', '<'],
    'error': ['>']
}

export async function printTestDuration(vusers:string, startTime:Date) 
{
    let endTime = new Date();
    console.log("TestRun completed\n");
    console.log("-------------------Summary ---------------");
    console.log("TestRun start time: "+ startTime);
    console.log("TestRun end time: "+ endTime);
    console.log("Virtual Users: "+ vusers);
    console.log("TestStatus: DONE \n");
    return;
}
export function printCriteria(criteria:any) {
    if(Object.keys(criteria).length == 0)
        return;
    printTestResult(criteria);
    console.log("Criteria\t\t\t\t\t :Actual Value\t        Result");
    for(var key in criteria) {
        var metric = criteria[key];
        var str = metric.aggregate+"("+metric.clientmetric+") "+ metric.condition+ ' '+metric.value;
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
export function getResultFolder(testArtifacts:any) {
    if(testArtifacts == null || testArtifacts.outputArtifacts == null)
        return null;
    var outputurl = testArtifacts.outputArtifacts;
    return (outputurl.resultUrl != null)? outputurl.resultUrl.url: null;
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
export function validCriteria(data:any) {
    switch(data.clientmetric) {
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