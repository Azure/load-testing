import { AuthenticationUtils } from "./AuthenticationUtils";
import { ApiVersionConstants, FetchCallType } from "./UtilModels";
import * as FetchUtil from "./FetchHelper";
import * as Util from "./util";
import { AppComponents, LoadTestResource, ServerMetricConfig, TestModel, TestRunModel, FileType } from "./PayloadModels";
import { isNullOrUndefined } from "util";

export class APIService {
    authContext: AuthenticationUtils;
    baseURL: string = '';
    testId: string = '';
    
    constructor(authContext : AuthenticationUtils) {
        this.authContext = authContext;
    }

    async getDataPlaneURL(id: string) : Promise<string> {
        let armUrl = this.authContext.armEndpoint;
        let armEndpointSuffix = id + "?api-version=" + ApiVersionConstants.cp2022Version;
        let armEndpoint = new URL(armEndpointSuffix, armUrl);
        let header = await this.authContext.armTokenHeader();
        let response = await FetchUtil.httpClientRetries(armEndpoint.toString(),header,FetchCallType.get,3,"");
        let resourceName = Util.getResourceNameFromResourceId(id);
        if(response.message.statusCode == 200) {
            let respObj: LoadTestResource = await Util.getResultObj(response);
            if(respObj.properties?.dataPlaneURI) {
                let dataPlaneUrl = respObj.properties.dataPlaneURI;
                return dataPlaneUrl;
            }
            throw new Error(`The dataplane URL is not present for the load test resource ${resourceName}, this resource cannot be used for running the tests. Please provide a valid resource.`);
        }
        if(response.message.statusCode == 404) {
            var message = `The Azure Load Testing resource ${resourceName} does not exist. Please provide an existing resource.`;
            throw new Error(message);
        }
        let errorObj: LoadTestResource = await Util.getResultObj(response);
        console.log(errorObj ? errorObj : Util.errorCorrection(response));
        throw new Error("Error fetching resource " + resourceName);
    }

    setBaseURL(dataPlaneUrl: string) {
        this.baseURL = "https://" + dataPlaneUrl + "/";
    }

    setTestId(id: string) {
        this.testId = id;
    }

    async getTestAPI(allow404 : boolean = false): Promise<TestModel | null> {
        let urlSuffix = "tests/"+this.testId+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.get);
        let testResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.get,3,"");

        if(testResult.message.statusCode == 200) {
            let testObj: TestModel = await Util.getResultObj(testResult);
            if(testObj == null){
                throw new Error(Util.errorCorrection(testResult));
            }
            return testObj;
        } else if (testResult.message.statusCode == 404 && allow404) {
            return null;
        }

        if(testResult.message.statusCode == 401 || testResult.message.statusCode == 403){
            var message = "Service Principal does not have sufficient permissions. Please assign " 
            +"the Load Test Contributor role to the service principal. Follow the steps listed at "
            +"https://docs.microsoft.com/azure/load-testing/tutorial-cicd-github-actions#configure-the-github-actions-workflow-to-run-a-load-test ";

            throw new Error(message);
        }

        let errorObj:any=await Util.getResultObj(testResult);
        let err = errorObj?.error?.message ? errorObj?.error?.message : Util.errorCorrection(testResult);
        throw new Error(err);
    }

    async getAppComponents() : Promise<AppComponents | null> {
        let urlSuffix = "tests/"+ this.testId +"/app-components/"+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.get);
        let appComponentsResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.get,3,"");
        if(appComponentsResult.message.statusCode == 200) {
            let appComponentsObj: AppComponents = await Util.getResultObj(appComponentsResult);
            return appComponentsObj;
        }
        return null;
    }

    async getServerMetricsConfig() : Promise<ServerMetricConfig | null> {
        let urlSuffix = "tests/"+ this.testId+"/server-metrics-config/"+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.get);
        let serverComponentsResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.get,3,"");
        if(serverComponentsResult.message.statusCode == 200) {
            let serverComponentsObj: ServerMetricConfig = await Util.getResultObj(serverComponentsResult);
            return serverComponentsObj;
        }
        return null;
    }

    async uploadFile(filepath: string, fileType : FileType, retries: number = 3) {
        let filename = Util.getFileName(filepath);
        let urlSuffix = "tests/"+ this.testId +"/files/"+filename+"?api-version="+ ApiVersionConstants.latestVersion + ("&fileType=" + fileType);
        let url = new URL(urlSuffix, this.baseURL);
        let headers = await this.authContext.getDataPlaneHeader(FetchCallType.put);
        let uploadresult = await FetchUtil.httpClientRetries(url.toString(),headers,FetchCallType.put,retries,filepath, true);
        if(uploadresult.message.statusCode != 201){
            let errorObj:any = await Util.getResultObj(uploadresult);
            console.log(errorObj ? errorObj : Util.errorCorrection(uploadresult));
            throw new Error(`Error in uploading file: ${filename} for the created test`);
        }
    }

    async deleteFileAPI(filename:string) : Promise<void> {
        var urlSuffix = "tests/"+this.testId+"/files/"+filename+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.delete);
        let delFileResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.delete,3,"");
        if(delFileResult.message.statusCode != 204) {
            let errorObj:any=await Util.getResultObj(delFileResult);
            let Message: string = errorObj ? errorObj.message : Util.errorCorrection(delFileResult);
            throw new Error(Message);
        }
        return;
    }

    async createTestAPI(createData: TestModel) : Promise<TestModel> {
        let urlSuffix = "tests/"+this.testId+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.patch);
        let createTestresult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.patch,3,JSON.stringify(createData));
        if(createTestresult.message.statusCode != 200 && createTestresult.message.statusCode != 201) {
            let errorObj:any=await Util.getResultObj(createTestresult);
            console.log(errorObj ? errorObj : Util.errorCorrection(createTestresult));
            throw new Error("Error in creating test: " + this.testId);
        }
        let testObj: TestModel=await Util.getResultObj(createTestresult);
        return testObj;
    }

    async patchAppComponents(appComponentsData : AppComponents) : Promise<AppComponents | null> {
        let urlSuffix = "tests/"+this.testId+"/app-components/"+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        if(!isNullOrUndefined(appComponentsData?.components) && Object.keys(appComponentsData.components).length == 0) {
            return null;
        }
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.patch);
        let appComponentsResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.patch,3,JSON.stringify(appComponentsData));
        if((appComponentsResult.message.statusCode != 200 && appComponentsResult.message.statusCode != 201)) {
            let errorObj:any=await Util.getResultObj(appComponentsResult);
            console.log(errorObj ? errorObj : Util.errorCorrection(appComponentsResult));
            throw new Error("Error in updating app components");
        }
        let appComponentsObj: AppComponents = await Util.getResultObj(appComponentsResult);
        return appComponentsObj;
    }

    async patchServerMetricsConfig(serverMetricsData : ServerMetricConfig) : Promise<ServerMetricConfig | null>{
        let urlSuffix = "tests/"+this.testId+"/server-metrics-config/"+"?api-version="+ ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        if(!isNullOrUndefined(serverMetricsData?.metrics) && Object.keys(serverMetricsData.metrics).length == 0) {
            return null;
        }
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.patch);
        let serverMetricsResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.patch,3,JSON.stringify(serverMetricsData));
        if(serverMetricsResult.message.statusCode != 200 && serverMetricsResult.message.statusCode != 201) {
            let errorObj:any=await Util.getResultObj(serverMetricsResult);
            console.log(errorObj ? errorObj : Util.errorCorrection(serverMetricsResult));
            throw new Error("Error in updating server metrics");
        }
        let serverComponentsObj: ServerMetricConfig = await Util.getResultObj(serverMetricsResult);
        return serverComponentsObj;
    }
    
    async createTestRun(startData : TestRunModel) : Promise<TestRunModel> {
        const testRunId = startData.testRunId;
        let urlSuffix = "test-runs/"+testRunId+"?api-version=" + ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.patch);
        let startTestresult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.patch,3,JSON.stringify(startData));
        let testRunResp: TestRunModel = await Util.getResultObj(startTestresult);
        if(startTestresult.message.statusCode != 200 && startTestresult.message.statusCode != 201 || isNullOrUndefined(testRunResp)) {
            console.log(testRunResp ? testRunResp : Util.errorCorrection(startTestresult));
            throw new Error("Error in running the test");
        }
        return testRunResp;
    }

    async getTestRunAPI(testRunId:string) : Promise<TestRunModel>{   
        let urlSuffix = "test-runs/"+testRunId+"?api-version=" + ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, this.baseURL);
        let header = await this.authContext.getDataPlaneHeader(FetchCallType.get);
        let testRunResult = await FetchUtil.httpClientRetries(url.toString(),header,FetchCallType.get,3,"");
        let testRunObj: TestRunModel = await Util.getResultObj(testRunResult);
        if (testRunResult.message.statusCode != 200 && testRunResult.message.statusCode != 201) {
            console.log(testRunObj ? testRunObj : Util.errorCorrection(testRunResult));
            throw new Error("Error in getting the test run");
        }
        return testRunObj;
    }

    // only used in post process and we dont care about the error or any, we just send stop signal and exit the task, this is when pipeline is cancelled.
    async stopTestRun(baseUri: string, testRunId: string) {
        let urlSuffix = "test-runs/"+testRunId+":stop?api-version=" + ApiVersionConstants.latestVersion;
        let url = new URL(urlSuffix, baseUri);
        let headers = await this.authContext.getDataPlaneHeader(FetchCallType.post);
        await FetchUtil.httpClientRetries(url.toString(),headers,FetchCallType.post,3,'');
    }
}