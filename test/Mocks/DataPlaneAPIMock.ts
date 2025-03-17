import nock from "nock";
import * as Constants from "../Constants/Constants";
import { ApiVersionConstants } from "../../src/models/UtilModels";
import { FileType } from "../../src/models/PayloadModels";

export class DataPlaneAPIMock {
    public resourceId: string;

    constructor(resourceId: string) {
        this.resourceId = resourceId;
    }

    public mockGetTest(testId: string, statusCode: number = 200, response: any = null) {
        if (response == null) {
            response = statusCode == 200 ? Constants.testModel : Constants.errorResponse;
        }

        nock(Constants.loadtestConfig.dataPlaneUrl)
            .get(`${Constants.APIRoute.Test}/${testId}`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockGetTestAppComponents(testId: string, statusCode: number = 200, response: any = null) {
        if (response == null) {
            response = statusCode == 200 ? Constants.appComponentsModel : Constants.errorResponse;
        }

        nock(Constants.loadtestConfig.dataPlaneUrl)
            .get(`${Constants.APIRoute.Test}/${testId}${Constants.APIRoute.AppComponents}/`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockGetTestServerMetricConfigs(testId: string, statusCode: number = 200, response: any = null) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .get(`${Constants.APIRoute.Test}/${testId}${Constants.APIRoute.ServerMetricsConfig}/`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockUploadFile(testId: string, fileName: string, fileType: FileType, statusCode: number = 201) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .put(`${Constants.APIRoute.Test}/${testId}${Constants.APIRoute.Files}/${fileName}`)
            .query({ "api-version": ApiVersionConstants.latestVersion, "fileType": fileType })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode);
    }

    public mockDeleteFile(testId: string, fileName: string, statusCode: number = 204) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .delete(`${Constants.APIRoute.Test}/${testId}${Constants.APIRoute.Files}/${fileName}`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode);
    }

    public mockCreateTest(testId: string, statusCode: number = 201, response: any = null) {
        if (response == null) {
            response = statusCode == 200 || statusCode == 201 ? Constants.testModel : Constants.errorResponse;
        }

        nock(Constants.loadtestConfig.dataPlaneUrl)
            .patch(`${Constants.APIRoute.Test}/${testId}`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockPatchTestAppComponents(testId: string, statusCode: number = 201, response: any = null) {
        if (response == null) {
            response = statusCode == 200 || statusCode == 201 ? Constants.appComponentsModel : Constants.errorResponse;
        }

        nock(Constants.loadtestConfig.dataPlaneUrl)
            .patch(`${Constants.APIRoute.Test}/${testId}${Constants.APIRoute.AppComponents}/`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockPatchTestServerMetricConfigs(testId: string, statusCode: number = 201, response: any = null) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .patch(`${Constants.APIRoute.Test}/${testId}${Constants.APIRoute.ServerMetricsConfig}/`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockCreateTestRun(testRunId: string, statusCode: number = 201, response: any = null) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .patch(`${Constants.APIRoute.TestRun}/${testRunId}`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockGetTestRun(testRunId: string, statusCode: number = 200, response: any = null) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .get(`${Constants.APIRoute.TestRun}/${testRunId}`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueDataPlane)
            .reply(statusCode, JSON.stringify(response));
    }

    public mockGetFeatureFlag(flagName: string, statusCode: number = 200, response: any = null) {
        nock(Constants.loadtestConfig.dataPlaneUrl)
            .get(`${Constants.APIRoute.FeatureFlags}/${flagName}`)
            .query({ "api-version": ApiVersionConstants.latestVersion })
            .reply(statusCode, JSON.stringify(response));
    }
}