export class DefaultYamlModel
{
    version: string ='';
    testId: string = '';
    testName: string = '';
    displayName: string = '';
    description: string = '';
    testPlan: string = '';
    testType: string = '';
    engineInstances: number = 0;
    subnetId: string = '';
    publicIPDisabled: boolean = false;
    configurationFiles: Array<string> = [];
    zipArtifacts: Array<string> = [];
    splitAllCSVs: boolean = false;
    properties: { userPropertyFile: string } = { userPropertyFile: '' };
    env: Array<{ name: string, value: string }> = [];
    certificates: Array<{ name: string, value: string }> = [];
    secrets: Array<{ name: string, value: string }> = [];
    failureCriteria: Array<string> = [];
    appComponents: Array<{resourceId: string, kind: string, metrics: Array<{name: string, aggregation: string, namespace?: string}>}> = [];
    autoStop: { errorPercentage: number, timeWindow: number } = { errorPercentage: 0, timeWindow: 0 };
    keyVaultReferenceIdentity: string = '';
    keyVaultReferenceIdentityType: string = '';
    regionalLoadTestConfig: Array<{region: string, engineInstances: number}> = [];
    referenceIdentities: Array<{kind: string, type: string, value: string}> = [];
}

export const overRideParamsJSON: any = {

    testId: 'SampleTest',
    displayName: 'SampleTest',
    description: 'Load test website home page',
    engineInstances: 1,
    autoStop: { errorPercentage: 80, timeWindow: 60 },
}

export class OverRideParametersModel {
    testId: string = '';
    displayName: string = '';
    description: string = '';
    engineInstances: number = 0;
    autoStop: { errorPercentage: number, timeWindow: number } = { errorPercentage: 0, timeWindow: 0 };
}

export const testmanagerApiVersion = "2024-07-01-preview";

export const autoStopDisable = "disable";

namespace BaseAPIRoute {
    export const featureFlag = "featureFlags";
}

export namespace APIRoute {
    const latestVersion = "api-version="+testmanagerApiVersion;
    export const FeatureFlags = (flag: string) => `${BaseAPIRoute.featureFlag}/${flag}?${latestVersion}`;
}

export const OutputVariableName = 'ALTOutputVar';