import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import { APIService } from "../src/services/APIService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import { ControlPlaneAPIMock } from "./Mocks/ControlPlaneAPIMock";

describe('dataPlane URL tests', () => {

    let authenticatorServiceMock: AuthenticatorServiceMock;

    beforeEach(function () {
        authenticatorServiceMock = new AuthenticatorServiceMock();
        authenticatorServiceMock.setupMock();
    });
  
    afterEach(function () {
        nock.cleanAll();
        sinon.restore();
    });

    it("returns dataPlane URL", async () => {
        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let apiService = new APIService(authenticatorService);
        let controlPlaneAPIMock = new ControlPlaneAPIMock(Constants.loadtestResourceId);
        controlPlaneAPIMock.mockGetLoadTestResource(200, true);

        let url = await apiService.getDataPlaneURL(Constants.loadtestResourceId);
        expect(url).toBe(Constants.loadtestConfig.dataPlaneUrl);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(false);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(true);
    });

    it("throws error with no dataPlane URL", async () => {
        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let apiService = new APIService(authenticatorService);
        let controlPlaneAPIMock = new ControlPlaneAPIMock(Constants.loadtestResourceId);
        controlPlaneAPIMock.mockGetLoadTestResource(200, false);

        await expect(apiService.getDataPlaneURL(Constants.loadtestResourceId)).rejects.toThrow(`The dataplane URL is not present for the load test resource ${Constants.loadtestConfig.resourceName}`);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(false);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(true);
    });

    it("throws error with 404 response", async () => {
        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let apiService = new APIService(authenticatorService);
        let controlPlaneAPIMock = new ControlPlaneAPIMock(Constants.loadtestResourceId);
        controlPlaneAPIMock.mockGetLoadTestResource(404, false);

        await expect(apiService.getDataPlaneURL(Constants.loadtestResourceId)).rejects.toThrow(`The Azure Load Testing resource ${Constants.loadtestConfig.resourceName} does not exist`);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(false);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(true);
    });

    it("throws error with 400 response", async () => {
        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let apiService = new APIService(authenticatorService);
        let controlPlaneAPIMock = new ControlPlaneAPIMock(Constants.loadtestResourceId);
        controlPlaneAPIMock.mockGetLoadTestResource(400, false);

        await expect(apiService.getDataPlaneURL(Constants.loadtestResourceId)).rejects.toThrow(`Error fetching resource ${Constants.loadtestConfig.resourceName}`);
        expect(authenticatorServiceMock.getDataPlaneHeaderCalled()).toBe(false);
        expect(authenticatorServiceMock.getARMTokenHeaderCalled()).toBe(true);
    });
})