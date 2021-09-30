import * as fs from 'fs';
var path = require('path');
var AdmZip = require("adm-zip");
const { v4: uuidv4 } = require('uuid');

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
export async function getResultsFile(response:any) 
{
    try {
        const filePath = path.join('dropResults','results.zip');
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
        throw err;
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
        throw err;
    }
}

function printMetrics(data:any) {
    console.log(data.transaction);
    console.log("response time \t\t : avg="+getAbsVal(data.meanResTime)+"ms min="+getAbsVal(data.minResTime)+"ms med="+getAbsVal(data.medianResTime)+"ms max="+getAbsVal(data.maxResTime)+"ms p(90)="+getAbsVal(data.pct1ResTime)+"ms p(95)="+getAbsVal(data.pct2ResTime)+"ms p(99)="+getAbsVal(data.pct3ResTime)+"ms");
    console.log("requests per sec \t : avg="+getAbsVal(data.throughput));
    console.log("total requests \t\t : "+data.sampleCount)
    console.log("total errors \t\t : " + data.errorCount)
    console.log("total error rate \t : "+data.errorPct);
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

export function getTestRunId() {
    return uuidv4();
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