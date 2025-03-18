import nock from "nock";
import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import * as Constants from "./Constants/Constants";
import { AuthenticatorServiceMock } from "./Mocks/AuthenticatorServiceMock";
import { DataPlaneAPIMock } from "./Mocks/DataPlaneAPIMock";
import { FeatureFlagService } from "../src/services/FeatureFlagService";
import { FeatureFlags } from "../src/models/FeatureFlags";

describe('feature flag service tests', () => {

    let authenticatorServiceMock: AuthenticatorServiceMock;
    let featureFlagService: FeatureFlagService;

    beforeEach(function () {
        authenticatorServiceMock = new AuthenticatorServiceMock();
        authenticatorServiceMock.setupMock();

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        featureFlagService = new FeatureFlagService(authenticatorService);
    });
  
    afterEach(function () {
        nock.cleanAll();
        sinon.restore();
    });

    it("isFeatureEnabledAsync returns true if enabled", async () => {
        let response = {
            featureFlag: "fakeFlag",
            enabled: true
        };
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetFeatureFlag('fakeFlag', 200, response);

        let result = await featureFlagService.isFeatureEnabledAsync('fakeFlag' as FeatureFlags, Constants.loadtestConfig.dataPlaneUrl, true);

        expect(result).toEqual(true);
    });

    it("isFeatureEnabledAsync returns false if not enabled", async () => {
        let response = {
            featureFlag: "fakeFlag",
            enabled: false
        };
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetFeatureFlag('fakeFlag', 200, response);

        let result = await featureFlagService.isFeatureEnabledAsync('fakeFlag' as FeatureFlags, Constants.loadtestConfig.dataPlaneUrl, true);

        expect(result).toEqual(false);
    });

    it("isFeatureEnabledAsync returns false on failure", async () => {
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetFeatureFlag('fakeFlag', 400, null);

        let result = await featureFlagService.isFeatureEnabledAsync('fakeFlag' as FeatureFlags, Constants.loadtestConfig.dataPlaneUrl, true);

        expect(result).toEqual(false);
    });

    it("isFeatureEnabledAsync returns true on success after failure", async () => {
        let dataPlaneAPIMock = new DataPlaneAPIMock(Constants.loadtestResourceId);
        dataPlaneAPIMock.mockGetFeatureFlag('fakeFlag', 400, null);

        let result = await featureFlagService.isFeatureEnabledAsync('fakeFlag' as FeatureFlags, Constants.loadtestConfig.dataPlaneUrl, true);

        let response = {
            featureFlag: "fakeFlag",
            enabled: true
        };
        dataPlaneAPIMock.mockGetFeatureFlag('fakeFlag', 200, response);
        result = await featureFlagService.isFeatureEnabledAsync('fakeFlag' as FeatureFlags, Constants.loadtestConfig.dataPlaneUrl, true);

        expect(result).toEqual(true);
    });
})