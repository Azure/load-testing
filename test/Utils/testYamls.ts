export const basicYaml : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'UserAssigned'
}

export const caseSensitiveYaml : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 1,
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.network/virtualnetworks/load-testing-vnet/subnets/load-testing',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.managedidentity/userassignedidentities/sample-identity',
    keyVaultReferenceIdentityType: 'UserAssigned'
}

export const urlYaml : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.json',
    testType: 'URL',
    engineInstances: 1,
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'UserAssigned'
}

export const locustYaml : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.py',
    testType: 'Locust',
    engineInstances: 1,
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'locust.conf' },
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'UserAssigned'
}

export const subnetIdPIPDisabledTrue : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.json',
    testType: 'URL',
    engineInstances: 1,
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg()/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: true,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'user.properties' },
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg()/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'UserAssigned'
}

export const invalidYaml : number = 123;

export const unsupportedFiled : any = {
    version: 'v0.1',
    testId : 'sampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    xyz : 'unsupported',
    mohit : 'unsupported'
}

export const noTestID : any = 
{
    version: 'v0.1',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const invalidTestID : any = 
{
    version: 'v0.1',
    displayName: 'Sample Test',
    testId : 'moh1`2!',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const noTestPlan : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const invalidDisplayName : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample TestSample TestSample TestSample TestSample TestSample Test',
    description: 'Load test website home page',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const invalidDescription : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    description: 'Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const invalidTestType : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.json',
    testType: 'Invalid',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const wrongTestPlanURL : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'URL',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const wrongTestPlanJMX : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.json',
    testType: 'JMX',
    engineInstances: 1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const wrongTestPlanLocust : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.json',
    testType: 'Locust',
    engineInstances: 1,
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs: true,
    properties: { userPropertyFile: 'locust.conf' },
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

// negative engines
export const invalidEngines1 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'URL',
    engineInstances: -1,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

// more than max allowed engines
export const invalidEngines2 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'URL',
    engineInstances: 500,
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

// not an integer
export const invalidEngines3 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'URL',
    engineInstances: 'mohit',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

// subscription not given
export const invalidSubnet1 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    subnetId: '/subscriptions/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

// resource group name is invalid
export const invalidSubnet2 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/{sample-rg1`!}/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

//vnet name is invalid
export const invalidSubnet3 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg1()/providers/Microsoft.Network/virtualNetworks/load-())/subnets/load-testing',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

// invalid rg and vnet name in kvid
export const invalidKVID : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    keyVaultReferenceIdentity: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/{sample-rg1}/providers/Microsoft.Network/virtualNetworks/load-{}t/subnets/load-testing',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
}

export const invalidKVIDType : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentityType : 'Invalid'
}

export const systemAssignedNotValidForNonNullkvid : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    keyVaultReferenceIdentity: '/subscriptions/abcde01e/resourceGroups/rgName/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identityName',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentityType: 'SystemAssigned'
}

export const userAssignedNotValidForNullkvid : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
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
    autoStop: { errorPercentage: 80, timeWindow: 60 },
    keyVaultReferenceIdentityType: 'UserAssigned'
}

export const publicIPDisabledTrueWithoutSubnet : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    publicIPDisabled : true
}

export const invalidPublicIPDisabled : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    publicIPDisabled : 'mohit'
}

export const invalidSplitCSV : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: [ 'sampledata.csv' ],
    zipArtifacts: [ 'bigdata.zip' ],
    splitAllCSVs : 'invalid'
}

export const invalidConfigFiles : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: 'sampledata.csv',
    zipArtifacts: [ 'bigdata.zip' ],
}

export const invalidZipFiles : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: ['sampledata.csv' ],
    zipArtifacts: 'bigdata.zip',
}

export const invalidUserProp : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: ['sampledata.csv' ],
    properties : { userPropertyFile : 'mohit.prop' }
}

// non-string for the userprop file.
export const invalidUserProp2 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: ['sampledata.csv' ],
    properties : { userPropertyFile : 123 }
}

export const invalidUserProp3 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.py',
    testType: 'Locust',
    configurationFiles: ['sampledata.csv' ],
    properties : { userPropertyFile : 'invalid.properties' }
}

// autostop disable has string function and enable has dict function, so if it is string, only permissible value is disable.
export const invalidAutoStop1 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: ['sampledata.csv' ],
    autoStop : 'invalid'
}

// invalid errorperc.
export const invalidAutoStop2 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: ['sampledata.csv' ],
    autoStop : { errorPercentage : -1.1, timeWindow : 100}
}

// invalid time window
export const invalidAutoStop3 : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    configurationFiles: ['sampledata.csv' ],
    autoStop : { errorPercentage : 10.23, timeWindow : -100.01}
}

export const multiRegionConfigTestInvalidEngineInstances : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    regionalLoadTestConfig: [
      {
        region: 'eastus',
        engineInstances: -1,
      },
      {
        region: 'westus',
        engineInstances: 1,
      }
    ]
}

export const multiRegionConfigTestNullRegion : any =
{
  version: 'v0.1',
  testId: 'SampleTest',
  testName: 'SampleTest',
  displayName: 'Sample Test',
  description: 'Load test website home page',
  testPlan: 'SampleTest.jmx',
  testType: 'JMX',
  engineInstances: 2,
  regionalLoadTestConfig: [
    {
      region: null,
      engineInstances: 1,
    },
    {
      region: 'westus',
      engineInstances: 1,
    }
  ]
}

export const multiRegionConfigTestEmptyRegion : any =
{
  version: 'v0.1',
  testId: 'SampleTest',
  testName: 'SampleTest',
  displayName: 'Sample Test',
  description: 'Load test website home page',
  testPlan: 'SampleTest.jmx',
  testType: 'JMX',
  engineInstances: 2,
  regionalLoadTestConfig: [
    {
      region: "",
      engineInstances: 1,
    },
    {
      region: 'westus',
      engineInstances: 1,
    }
  ]
}

export const multiRegionConfigTestInvalidEngineInstanceSum : any =
{
  version: 'v0.1',
  testId: 'SampleTest',
  testName: 'SampleTest',
  displayName: 'Sample Test',
  description: 'Load test website home page',
  testPlan: 'SampleTest.jmx',
  testType: 'JMX',
  regionalLoadTestConfig: [
    {
      region: "eastus",
      engineInstances: 3,
    },
    {
      region: 'westus',
      engineInstances: 1,
    }
  ]
}

export const multiRegionConfigTestInvalidNumberOfRegions : any =
{
  version: 'v0.1',
  testId: 'SampleTest',
  testName: 'SampleTest',
  displayName: 'Sample Test',
  description: 'Load test website home page',
  testPlan: 'SampleTest.jmx',
  testType: 'JMX',
  regionalLoadTestConfig: [
    {
      region: "eastus",
      engineInstances: 1,
    }
  ]
}