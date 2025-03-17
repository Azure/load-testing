import { ApiVersionConstants } from "../models/UtilModels";

export class OverRideParametersModel {
    testId: string = '';
    displayName: string = '';
    description: string = '';
    engineInstances: number = 0;
    autoStop: { errorPercentage: number, timeWindow: number } = { errorPercentage: 0, timeWindow: 0 };
}

export const autoStopDisable = "disable";

namespace BaseAPIRoute {
    export const featureFlag = "featureFlags";
}

export namespace APIRoute {
    const latestVersion = "api-version=" + ApiVersionConstants.latestVersion;
    export const FeatureFlags = (flag: string) => `${BaseAPIRoute.featureFlag}/${flag}?${latestVersion}`;
}

export const OutputVariableName = 'ALTOutputVar';