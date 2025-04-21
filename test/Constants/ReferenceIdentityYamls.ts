// valid scenarios:
export const referenceIdentitiesBasicYaml : any = 
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
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [ { name: 'domain', value: 'https://www.contoso-ads.com' } ],
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
    autoStop: { errorPercentage: 80, timeWindow: 60, maximumVirtualUsersPerEngine: 5000, },
    referenceIdentities: [
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity"
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity"
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-engine2"
      },
    ],
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

export const referenceIdentitiesSystemAssignedBasicYaml : any = 
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
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [ { name: 'domain', value: 'https://www.contoso-ads.com' } ],
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
    autoStop: { errorPercentage: 80, timeWindow: 60, maximumVirtualUsersPerEngine: 5000, },
    referenceIdentities: [
      {
        kind : "KeyVault",
        type: "SystemAssigned",
      },
      {
        kind : "Metrics",
      },
      {
        kind : "Engine",
      }
    ],
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

export const referenceIdentitiesSystemAssignedAndUserAssignedYaml : any = 
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
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [ { name: 'domain', value: 'https://www.contoso-ads.com' } ],
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
    autoStop: { errorPercentage: 80, timeWindow: 60, maximumVirtualUsersPerEngine: 5000, },
    referenceIdentities: [
      {
        kind : "KeyVault",
        type: "SystemAssigned",
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity"
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ],
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

export const noReferenceIdentities : any = 
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
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [ { name: 'domain', value: 'https://www.contoso-ads.com' } ],
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
    autoStop: { errorPercentage: 80, timeWindow: 60, maximumVirtualUsersPerEngine: 5000, },
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

export const keyVaultGivenOutOfRefIds : any = 
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
    keyVaultReferenceIdentity : "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1",
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [ { name: 'domain', value: 'https://www.contoso-ads.com' } ],
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
    autoStop: { errorPercentage: 80, timeWindow: 60, maximumVirtualUsersPerEngine: 5000, },
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

// invalid starts
export const referenceIdentities2SystemAssignedForKeyVault : any = 
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
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    env: [ { name: 'domain', value: 'https://www.contoso-ads.com' } ],
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
    autoStop: { errorPercentage: 80, timeWindow: 60, maximumVirtualUsersPerEngine: 5000, },
    referenceIdentities: [
      {
        kind : "KeyVault",
      },
      {
        kind : "KeyVault",
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity"
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ],
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

export const referenceIdentities2SystemAssignedForMetrics : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Metrics",
      },
      {
        kind : "Metrics",
      },
      {
        kind : "KeyVault",
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentities2SystemAssignedForEngine : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Engine",
      },
      {
        kind : "Engine",
      },
      {
        kind : "KeyVault",
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentities2UAMIForKeyVault : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Engine",
      },
      {
        kind : "Metrics",
      },
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentities2UAMIForMetrics : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Engine",
      },
      {
        kind : "KeyVault",
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentitiesSystemAssignedAndUAMIForKeyVault : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Engine",
      },
      {
        kind : "KeyVault",
      },
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentitiesSystemAssignedAndUAMIForMetrics : any = 
{
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Engine",
      },
      {
        kind : "Metrics",
      },
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentitiesSystemAssignedAndUAMIForEngine : any = 
{
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Engine",
      },
      {
        kind : "Metrics",
      },
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentitiesGivenInKeyVaultOutsideAndInside : any = 
{
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    keyVaultReferenceIdentity : "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1",
    referenceIdentities: [
      {
        kind : "Metrics",
      },
      {
        kind : "KeyVault",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      },
      {
        kind : "Engine",
        type: "UserAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentitiesNotAnArray : any = 
{
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    keyVaultReferenceIdentity : "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1",
    referenceIdentities: {
      hi: 123
    }
}

export const referenceIdentitiesWithImproperKind : any = 
{
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    keyVaultReferenceIdentity : "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1",
    referenceIdentities: [
      {
        kind : "MetricsDummy",
      }
    ]
}

export const referenceIdentitiesWithImproperType : any = 
{
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    keyVaultReferenceIdentity : "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1",
    referenceIdentities: [
      {
        kind : "Metrics",
        type: "Dummy"
      }
    ]
}

export const referenceIdentityWithValueButSystemAssigned: any = {
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Metrics",
        type: "SystemAssigned",
        value: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1"
      }
    ]
}

export const referenceIdentityWithNoValueButUserAssigned: any = {
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Metrics",
        type: "UserAssigned"
      }
    ]
}

export const referenceIdentitywithInvalidKVID: any = {
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: "dummy"
      }
    ]
}

export const referenceIdentitywithInvalidKVIDAsStringItself: any = {
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      {
        kind : "Metrics",
        type: "UserAssigned",
        value: ["hi123", "123"]
      }
    ]
}


export const referenceIdentitywithInvalidDict: any = {
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
      "mohit1", "mohit2"
    ]
}

export const referenceIdentityTypewithInvalidStringInKVID: any = {
    version: 'v0.1',
    testName: 'SampleTest',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    referenceIdentities: [
        {
          kind : "Metrics",
          type: ["UserAssigned", "SystemAssigned"],
        }
      ]
}