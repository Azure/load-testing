import { ManagedIdentityTypeForAPI, TestModel } from "../../src/models/PayloadModels";
import { TestKind } from "../../src/models/TestKind";

export const createBasicJmxTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    displayName: 'sampletest',
    kind: TestKind.JMX,
    loadTestConfiguration: {
        engineInstances: 1
    },
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
}

export const createJmxTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 2,
        splitAllCSVs: true,
        regionalLoadTestConfig: [
            {
                region: 'eastus',
                engineInstances: 1
            },
            {
                region: 'westus',
                engineInstances: 1
            }
        ]
    },
    secrets: {
        'my-secret': {
            type: 'AKV_SECRET_URI',
            value: 'https://akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
        }
    },
    kind: TestKind.JMX,
    certificate: {
        name: 'my-certificate',
        type: 'AKV_CERT_URI',
        value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
    },
    environmentVariables: { domain: 'https://www.contoso-ads.com' },
    passFailCriteria: {
        // NOTE: Since pass fail metrics use random GUIDs, we can't predict the exact value in create flow
        passFailMetrics: expect.any(Object),
        passFailServerMetrics: {}
    },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: 5000
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
}

export const editJmxTestResponse: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    kind: TestKind.JMX,
    secrets: {
        'my-secret': {
            type: 'AKV_SECRET_URI',
            value: 'oldvalue'
        },
        'to-be-removed': {
            type: 'AKV_SECRET_URI',
            value: 'oldvalue'
        }
    },
    environmentVariables: { domain: 'oldvalue', toBeRemoved: 'oldvalue' },
    passFailCriteria: {
        passFailMetrics: {
            'passfailmetric1': {
                clientMetric: 'response_time_ms',
                aggregate: 'avg',
                condition: '>',
                action: 'continue',
                value: 300,
                requestName: null,
            },
            'passfailmetric2':  {
                clientMetric: 'error',
                aggregate: 'percentage',
                condition: '>',
                action: 'continue',
                value: 50,
                requestName: null,
            },
            'passfailmetric3':  {
                clientMetric: 'latency',
                aggregate: 'avg',
                condition: '>',
                action: 'continue',
                value: 200,
                requestName: 'GetCustomerDetails',
            },
            'passfailmetric4':  {
                clientMetric: 'latency',
                aggregate: 'avg',
                condition: '>',
                action: 'continue',
                value: 300,
                requestName: 'GetCustomerDetails',
            },
        },
        passFailServerMetrics: {}
    }
}

export const editJmxTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 2,
        splitAllCSVs: true,
        regionalLoadTestConfig: [
            {
                region: 'eastus',
                engineInstances: 1
            },
            {
                region: 'westus',
                engineInstances: 1
            }
        ]
    },
    secrets: {
        'my-secret': {
            type: 'AKV_SECRET_URI',
            value: 'https://akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
        },
        'to-be-removed': null
    },
    kind: TestKind.JMX,
    certificate: {
        name: 'my-certificate',
        type: 'AKV_CERT_URI',
        value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
    },
    environmentVariables: { domain: 'https://www.contoso-ads.com', toBeRemoved: null },
    passFailCriteria: {
        passFailMetrics: {
            'passfailmetric1': {
                clientMetric: 'response_time_ms',
                aggregate: 'avg',
                condition: '>',
                action: 'continue',
                value: 300,
                requestName: null,
            },
            'passfailmetric2':  {
                clientMetric: 'error',
                aggregate: 'percentage',
                condition: '>',
                action: 'continue',
                value: 50,
                requestName: null,
            },
            'passfailmetric3':  {
                clientMetric: 'latency',
                aggregate: 'avg',
                condition: '>',
                action: 'continue',
                value: 200,
                requestName: 'GetCustomerDetails',
            },
            'passfailmetric4':  null
        },
        passFailServerMetrics: {}
    },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: 5000
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
}

export const overrideParams = {
    testId: 'overridetestid',
    displayName: 'Override Display Name',
    description: 'Override Description',
    autoStop: {
        errorPercentage: 20,
        timeWindow: 30
    }
};

export const createOverrideParamsJmxTestExpectedPayload: TestModel = {
    testId: 'overridetestid',
    description: 'Override Description',
    displayName: 'Override Display Name',
    loadTestConfiguration: {
        engineInstances: 2,
        splitAllCSVs: true,
        regionalLoadTestConfig: [
            {
                region: 'eastus',
                engineInstances: 1
            },
            {
                region: 'westus',
                engineInstances: 1
            }
        ]
    },
    secrets: {
        'my-secret': {
            type: 'AKV_SECRET_URI',
            value: 'https://akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
        }
    },
    kind: TestKind.JMX,
    certificate: {
        name: 'my-certificate',
        type: 'AKV_CERT_URI',
        value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
    },
    environmentVariables: { domain: 'https://www.contoso-ads.com' },
    passFailCriteria: {
        // NOTE: Since pass fail metrics use random GUIDs, we can't predict the exact value in create flow
        passFailMetrics: expect.any(Object),
        passFailServerMetrics: {}
    },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 20,
        errorRateTimeWindowInSeconds: 30
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
}

export const createUrlTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 1,
        splitAllCSVs: true,
    },
    kind: TestKind.URL,
    certificate: null,
    passFailCriteria: { passFailMetrics: {}, passFailServerMetrics: {} },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: 5000
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
}

export const createLocustTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 1,
        splitAllCSVs: true,
    },
    kind: TestKind.Locust,
    passFailCriteria: { passFailMetrics: {}, passFailServerMetrics: {} },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: 5000
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
}

export const createPublicIPDisabledTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 1,
        splitAllCSVs: true,
    },
    secrets: {},
    kind: TestKind.URL,
    certificate: null,
    environmentVariables: {},
    passFailCriteria: { passFailMetrics: {}, passFailServerMetrics: {} },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: 5000
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg()/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: true,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg()/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
}

export const createReferenceIdentitiesTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 2,
        splitAllCSVs: true,
        regionalLoadTestConfig: [
            {
                region: 'eastus',
                engineInstances: 1
            },
            {
                region: 'westus',
                engineInstances: 1
            }
        ]
    },
    secrets: {
        'my-secret': {
            type: 'AKV_SECRET_URI',
            value: 'https://akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
        }
    },
    kind: TestKind.JMX,
    certificate: {
        name: 'my-certificate',
        type: 'AKV_CERT_URI',
        value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
    },
    environmentVariables: { domain: 'https://www.contoso-ads.com' },
    passFailCriteria: {
        passFailMetrics: expect.any(Object),
        passFailServerMetrics: {}
    },
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: 5000
    },
    subnetId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing',
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    keyvaultReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity',
    engineBuiltinIdentityIds: [
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-1',  
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity-engine2'
    ],
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.UserAssigned,
    metricsReferenceIdentityId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/sample-identity'
}

export const editPFServerCriteriaTestResponse: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    kind: TestKind.JMX,
    passFailCriteria: {
        passFailServerMetrics: { 
            'pfserver1': {
                metricNameSpace: 'ServiceApiHit',
                metricName: 'Microsoft.KeyVault/vaults',
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                aggregation: 'Average',
                condition: '>',
                value: '80'
            },
            'pfserver2': {
                metricNameSpace: 'ServiceApiHit',
                metricName: 'Microsoft.KeyVault/vaults',
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                aggregation: 'Average',
                condition: '>',
                value: '80'
            }
        }
    }
}

export const editPFServerCriteriaTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 2,
    },
    kind: TestKind.JMX,
    passFailCriteria: {
        passFailMetrics: expect.any(Object),
        passFailServerMetrics: { 
            'pfserver1': {
                metricNameSpace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                aggregation: 'Average',
                condition: '>',
                value: '80'
            },
            'pfserver2': null
        }
    },
    publicIPDisabled: false,
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
}

export const undefinedMaxVUAutostopCriteriaTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 2,
    },
    kind: TestKind.JMX,
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
    },
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
}
export const nullMaxVUAutostopCriteriaTestExpectedPayload: TestModel = {
    testId: 'sampletest',
    description: 'Load test website home page',
    displayName: 'Sample Test',
    loadTestConfiguration: {
        engineInstances: 2,
    },
    kind: TestKind.JMX,
    autoStopCriteria: {
        autoStopDisabled: false,
        errorRate: 80,
        errorRateTimeWindowInSeconds: 60,
        maximumVirtualUsersPerEngine: null,
    },
    keyvaultReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
    engineBuiltinIdentityType: ManagedIdentityTypeForAPI.None,
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI.SystemAssigned,
}
