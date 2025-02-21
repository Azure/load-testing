import { IHeaders, IHttpClientResponse } from 'typed-rest-client/Interfaces';
import { ErrorCorrection, getResultObj, getUniqueId, sleep } from './util';
import { FetchCallType, correlationHeader } from './UtilModels';
import * as httpc from 'typed-rest-client/HttpClient';
import { uploadFileData } from './FileUtils';
const httpClient: httpc.HttpClient = new httpc.HttpClient('MALT-GHACTION');
import * as core from '@actions/core'

const methodEnumToString : { [key in FetchCallType] : string } = {
    [FetchCallType.get] : "get",
    [FetchCallType.post] : "post",
    [FetchCallType.put] : "put",
    [FetchCallType.delete] : "del",
    [FetchCallType.patch] : "patch"
}

// (note mohit): shift to the enum later.
export async function httpClientRetries(urlSuffix : string, header : IHeaders, method : FetchCallType, retries : number = 1,data : string, isUploadCall : boolean = true, log: boolean = true) : Promise<IHttpClientResponse>{
    let httpResponse : IHttpClientResponse;
    try {
        let correlationId = `gh-actions-${getUniqueId()}`;
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
            const organization = process.env.SYSTEM_TEAMFOUNDATIONCOLLECTIONURI;
            const project = process.env.SYSTEM_TEAMPROJECT;
            const buildId = process.env.BUILD_BUILDID;
            console.log(organization, project, buildId);
            const pipelineName = tl.getVariable("Build.DefinitionName") || tl.getVariable("Release.DefinitionName") || "Unavailable";
            const pipelineUrl = `${organization}${project}/_build/results?buildId=${buildId}`;

            header['x-ms-pipelineUrl'] = pipelineUrl;
            header['x-ms-pipelineName'] = pipelineName;   // setting these for patch calls.
            console.log(pipelineUrl, pipelineName, tl.getVariable("Build.DefinitionName"), tl.getVariable("Release.DefinitionName"));
            httpResponse = await httpClient.request(methodEnumToString[method], urlSuffix, data, header);
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
            if (log) {
                console.log(`Failed to connect to ${urlSuffix} due to ${err.message}, retrying in ${sleeptime/1000} seconds`);
            }
            await sleep(sleeptime);
            return await httpClientRetries(urlSuffix,header,method,retries-1,data);
        }
        else{
            throw new Error(`Operation did not succeed after 3 retries. Pipeline failed with error : ${err.message}`);
        }
    }
}