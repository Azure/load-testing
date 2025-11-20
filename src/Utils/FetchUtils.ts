import { IHeaders, IHttpClientResponse } from 'typed-rest-client/Interfaces';
import { errorCorrection, getResultObj, getUniqueId, sleep } from './CommonUtils';
import { FetchCallType, correlationHeader } from './../models/UtilModels';
import * as httpc from 'typed-rest-client/HttpClient';
import { uploadFileData } from './FileUtils';
const httpClient: httpc.HttpClient = new httpc.HttpClient('MALT-GHACTION');
import * as CoreUtils from './CoreUtils';

const methodEnumToString : { [key in FetchCallType] : string } = {
    [FetchCallType.get] : "get",
    [FetchCallType.post] : "post",
    [FetchCallType.put] : "put",
    [FetchCallType.delete] : "del",
    [FetchCallType.patch] : "patch"
}

// (note mohit): shift to the enum later.
export async function httpClientRetries(urlSuffix : string, header : IHeaders, method : FetchCallType , retries : number = 1, data : string , isUploadCall : boolean = true, log: boolean = true) : Promise<IHttpClientResponse>{
    let httpResponse : IHttpClientResponse;
    const retrriableCodes = [408,429,500,502,503,504]; // 408 - Request Timeout, 429 - Too Many Requests, 500 - Internal Server Error, 502 - Bad Gateway, 503 - Service Unavailable, 504 - Gateway Timeout
    let backOffTimeForRetry = 5; // seconds
    let correlationId = `gh-actions-${getUniqueId()}`;
    try {
        header[correlationHeader] = correlationId; // even if we put console.debug its printing along with the logs, so lets just go ahead with the differentiation with azdo, so we can search the timeframe for azdo in correlationid and resource filter.
        if(method == FetchCallType.get){
            httpResponse = await httpClient.get(urlSuffix, header);
        } else if(method ==  FetchCallType.delete){
            httpResponse = await httpClient.del(urlSuffix, header);
        } else if(method == FetchCallType.post){
            httpResponse = await httpClient.post(urlSuffix, data, header);
        } else if(method == FetchCallType.put && isUploadCall){
            let fileContent = uploadFileData(data);
            httpResponse = await httpClient.request(methodEnumToString[method], urlSuffix, fileContent, header);
        } else{
            const githubBaseUrl = process.env.GITHUB_SERVER_URL;
            const repository = process.env.GITHUB_REPOSITORY;
            const runId = process.env.GITHUB_RUN_ID;
            
            const pipelineName = process.env.GITHUB_WORKFLOW || "Unknown Pipeline";
            const pipelineUri = `${githubBaseUrl}/${repository}/actions/runs/${runId}`;
            
            header['x-ms-pipeline-name'] = pipelineName;   // setting these for patch calls.
            header['x-ms-pipeline-uri'] = pipelineUri;
            httpResponse = await httpClient.request(methodEnumToString[method], urlSuffix, data, header);
        }

        if(httpResponse.message.statusCode!= undefined && httpResponse.message.statusCode >= 300){
            CoreUtils.debug(`correlation id : ${correlationId}`);
        }
        if(httpResponse.message.statusCode!=undefined && retrriableCodes.includes(httpResponse.message.statusCode)){
            if(method == FetchCallType.patch){
                backOffTimeForRetry += 60; // extra 60 seconds for patch, basically this happens when the service didnot handle some of the external service dependencies, and the external can take time to recover.
            }
            let err = await getResultObj(httpResponse);
            throw {message : (err && err.error && err.error.message) ? err.error.message : errorCorrection(httpResponse)}; // throwing as message to catch it as err.message
        }
        return httpResponse;
    }
    catch(err:any){
        if(retries){
            let sleeptime = backOffTimeForRetry * 1000;
            if (log) {
                console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime/1000} seconds`);
            }
            await sleep(sleeptime);
            return await httpClientRetries(urlSuffix,header,method,retries-1,data);
        }
        else{
            console.log(err, "\ncorrelationId:" + correlationId);
            throw new Error(`Operation did not succeed after 3 retries. Pipeline failed with error : ${err.message}`);
        }
    }
}
