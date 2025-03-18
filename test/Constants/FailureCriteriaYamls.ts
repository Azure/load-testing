export const ClientAndServerPFDefaultMetrics : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ClientPFDefaultMetrics : any = 
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
    failureCriteria: [
        'avg(response_time_ms) > 300',
        'avg(response_time_ms) < 500',
        { GetCustomerName : 'avg(response_time_ms) > 3000' }
    ]
}

export const ServerPFMetricsNoNameSpace : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

// invalid starts.
export const ClientPFInvalidFailureEnum : any = 
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
    failureCriteria: {
        clientMetrics:[
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            ['GetCustomerName', 'avg(response_time_ms) > 3000' ]
        ],
        dummy:[

        ]
    }
}

export const ClientPFInvalidFailureNonArray : any = 
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
    failureCriteria: {
        clientMetrics:[
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            ['GetCustomerName', 'avg(response_time_ms) > 3000' ]
        ]
    }
}
export const ClientPFInvalidFailureCriteriaServerNonArray : any = 
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
    failureCriteria: {
        clientMetrics:[
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
        ],
        serverMetrics: "1:2"
    }
}

export const ClientPFInvalidString : any = 
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
    failureCriteria: [
        'avg(response_time_ms) > 300',
        'avg(response_time_ms) < 500',
        ['GetCustomerName', 'avg(response_time_ms) > 3000' ]
    ]
}

export const ServerPFMetricsWrongCondition : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'Dummy',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsWrongDictionary : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            "test-123"
        ]
    }
}

export const ServerPFMetricsNoResourceId : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsNoMetricName : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                aggregation:"test", 
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsNoaggregation : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsNoValue : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'GreaterThan',
            }
        ]
    }
}
export const ServerPFMetricsWrongResourceId : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: ["test1", "test2"],
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsWrongNameSpace : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricName: 'ServiceApiHit',
                metricNameSpace: ["test1", "test2"],
                aggregation: 'Average',
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsWrongMetricName : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                aggregation:"test",
                metricName: ["test1", "test2"],
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}

export const ServerPFMetricsWrongaggregation : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: ["test1", "test2"],
                condition: 'GreaterThan',
                value: 80
            }
        ]
    }
}
export const ServerPFMetricsWrongValue : any = 
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
    failureCriteria: {
        clientMetrics: [
            'avg(response_time_ms) > 300',
            'avg(response_time_ms) < 500',
            { GetCustomerName : 'avg(response_time_ms) > 3000' }
        ],
        serverMetrics: [
            {
                resourceId: '/subscriptions/7c71b563-0dc0-4bc0-bcf6-06f8f0516c7a/resourceGroups/kc-aci-rg/providers/Microsoft.KeyVault/vaults/acisextension',
                metricNamespace: 'Microsoft.KeyVault/vaults',
                metricName: 'ServiceApiHit',
                aggregation: 'Average',
                condition: 'GreaterThan',
                value: '80'
            }
        ]
    }
}