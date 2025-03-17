import * as Constants from "../Constants/Constants";
import nock from "nock";
import { ApiVersionConstants } from "../../src/models/UtilModels";

export class ControlPlaneAPIMock {
    public resourceId: string;

    constructor(resourceId: string) {
        this.resourceId = resourceId;
    }

    public mockGetLoadTestResource(statusCode: number = 200, addDataplaneUrl: boolean = true) {
        nock(Constants.armEndpoint)
            .get(`${this.resourceId.toLowerCase()}`)
            .query({ "api-version": ApiVersionConstants.cp2022Version })
            .matchHeader(Constants.authorizationHeader, Constants.authorizationHeaderValueControlPlane)
            .reply(statusCode, statusCode != 200 ? {} : {
                "id": this.resourceId,
                "name": Constants.loadtestConfig.resourceName,
                "type": Constants.loadtestConfig.resourceProvider,
                "location": Constants.loadtestConfig.location,
                "properties": {
                    "dataPlaneURI": addDataplaneUrl ? Constants.loadtestConfig.dataPlaneUrl : null,
                    "provisioningState": "Succeeded"
                }
            });
    }
}