export const defaultYaml: any =
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    configurationFiles: ['sampledata.csv'],
    zipArtifacts: ['bigdata.zip'],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [{ name: 'domain', value: 'https://www.contoso-ads.com' }],
    certificates: [
        {
            name: 'my-certificate',
            value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
        }
    ],
    secrets: [
        {
            name: 'my-secret',
            value: 'https://akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
        }
    ],
    failureCriteria: [
        'avg(response_time_ms) > 300',
        'percentage(error) > 50',
        { GetCustomerDetails: 'avg(latency) >200' }
    ],
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sampleApp",
            kind: "app",
            metrics:[
                {
                    name: "CpuPercentage",
                    aggregation: "Average"
                },
                {
                    name: "MemoryPercentage",
                    aggregation: "Average",
                    namespace: "Microsoft.Web/serverfarms"
                }
            ],
        },
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.KeyVault/vaults/sampleApp",
            metrics:[
                {
                    name: "ServiceApiHit",
                    aggregation: "Count",
                    namespace: "Microsoft.KeyVault/vaults"
                },
                {
                    name: "ServiceApiLatency",
                    aggregation: "Average"
                }
            ]
        }
    ],
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned',
    regionalLoadTestConfig: [
        {
            region: 'eastus',
            engineInstances: 1,
        },
        {
            region: 'westus',
            engineInstances: 1,
        }
    ],
    referenceIdentities: [
        {
          kind: "KeyVault",
          type: "UserAssigned",
          value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity"
        },
        {
          kind: "Metrics",
          type: "UserAssigned",
          value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity"
        }
    ]
}

export const testmanagerApiVersion = "2024-07-01-preview";

namespace BaseAPIRoute {
    export const featureFlag = "featureFlags";
}

export namespace APIRoute {
    const latestVersion = "api-version="+testmanagerApiVersion;
    export const FeatureFlags = (flag: string) => `${BaseAPIRoute.featureFlag}/${flag}?${latestVersion}`;
}
