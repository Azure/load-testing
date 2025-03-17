import { AppComponents, FileStatus, TestModel, TestRunModel } from "../../src/models/PayloadModels";
import { TaskParameters } from "../../src/models/TaskParameters";

export const armEndpoint = "https://management.azure.com";
export const serviceConnectionName = "fakeServiceConnectionName";
export const authorityUrl = "https://fakeAuthorityUrl";
export const authorizationScheme = "fakeScheme";
import * as EnvironmentConstants from "../../src/Constants/EnvironmentConstants";

export const loadtestConfig = {
    subscriptionId: "00000000-0000-0000-0000-000000000000",
    resourceGroup: "fakeResourceGroup",
    resourceName: "fakeResourceName",
    resourceProvider: "Microsoft.LoadTestService/loadtests",
    location: "eastus",
    dataPlaneUrl: "https://fakedataplaneurl.com",
    dataPlaneUrlWithoutProtocol: "fakedataplaneurl.com",
    testId: "fakeTestId",
    testRunId: "fakeTestRunId",
    testDisplayName: "Test-unit-test",
    email: "test@domain.com",
    sampleTimeStamp: "2022-03-07T14:48:28.905Z",
}

export const loadtestResourceId = `/subscriptions/${loadtestConfig.subscriptionId}/resourceGroups/${loadtestConfig.resourceGroup}/providers/${loadtestConfig.resourceProvider}/${loadtestConfig.resourceName}`;

 export const defaultTaskParameters: TaskParameters = {
    subscriptionId: loadtestConfig.subscriptionId,
    environment: EnvironmentConstants.AzurePublicCloud.cloudName,
    armTokenScope: EnvironmentConstants.AzurePublicCloud.armTokenScope,
    dataPlaneTokenScope: EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope,
    resourceId: loadtestResourceId,
    serviceConnectionName: serviceConnectionName,
    authorizationScheme: authorizationScheme,
    armEndpoint: armEndpoint,
    authorityHostUrl: authorityUrl,
};

export const APIRoute = {
    Test: '/tests',

    TestRun: '/test-runs',

    AppComponents: '/app-components',
    ServerMetricsConfig: '/server-metrics-config',
    Files: '/files',

    FeatureFlags: '/featureFlags',
}

export const testModel: TestModel = {
    testId: loadtestConfig.testId,
    description: "sample test",
    displayName: loadtestConfig.testDisplayName,
    loadTestConfiguration: {
        engineInstances: 1
    },
    createdDateTime: loadtestConfig.sampleTimeStamp,
    createdBy: loadtestConfig.email,
    lastModifiedDateTime: loadtestConfig.sampleTimeStamp,
    lastModifiedBy: loadtestConfig.email,
    inputArtifacts: {
        testScriptFileInfo: {
            url: "https://testurl",
            fileType: "JMX_FILE",
            fileName: "sample.jmx"
        },
        additionalFileInfo: []
    }
}

export const appComponentsModel: AppComponents = {
    components: {
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web': {
            resourceName: 'sample-web',
            kind: 'app, functionapp',
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        }
    }
}

export const errorResponse = {
    error: {
        code: "FakeErrorCode",
        message: "Fake Error Message"
    }
}

export const dataPlaneHeaders = {
    "content-type": "application/json",
    "Authorization": "Bearer fakeDataPlaneToken",
}

export const armTokenHeaders = {
    "Authorization": "Bearer fakeControlPlaneToken",
}

export const authorizationHeader = "Authorization";
export const authorizationHeaderValueDataPlane = "Bearer fakeDataPlaneToken";
export const authorizationHeaderValueControlPlane = "Bearer fakeControlPlaneToken";