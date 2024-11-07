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
    ]
}
