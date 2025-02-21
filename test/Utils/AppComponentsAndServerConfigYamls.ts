export const appComponentsWithMetrics : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            metrics: [
                {
                    name: "CpuPercentage",
                    aggregation: "Average"
                },
                {
                    name: "MemoryPercentage",
                    aggregation: "Average",
                    namespace: "Microsoft.Web/serverfarms"
                }
            ]
        },
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app, functionapp",
            metrics: [
                {
                    name: "CpuPercentage",
                    aggregation: "Average"
                },
                {
                    name: "MemoryPercentage",
                    aggregation: "Average",
                }
            ]
        },
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web/xyz",
            resourceName: "xyz",
            metrics: [
                {
                    name: "CpuPercentage",
                    aggregation: "Average"
                }
            ]
        }
    ]
}

export const appComponentsWithoutMetricsAndKind : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
        }
    ]
}

// invalid starts
export const appCompsInvalidResourceId : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms",
        }
    ]
}

export const appCompsInvalidKind : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: ["test", "test2"]
        }
    ]
}

export const appCompsInvalidResourceName : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: ["test", "test2"]
        }
    ]
}

export const appCompsInvalidMetricsArray : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: "test",
            metrics: "dummy"
        }
    ]
}

export const appCompsInvalidMetricDict : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: "test",
            metrics: [
                "hi,123"
            ]
        }
    ]
}

export const appCompsInvalidMetricName : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: "test",
            metrics: [
                {
                    name: [123],
                    aggregation: "Average"
                }
            ]
        }
    ]
}

export const appCompsInvalidMetricAggregation : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: "test",
            metrics: [
                {
                    name: "123",
                    aggregation: ["Average", "Min"]
                }
            ]
        }
    ]
}

export const appCompsInvalidMetricNameSpace : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: "test",
            metrics: [
                {
                    name: "123",
                    aggregation: "Average, min",
                    namespace: ["dummy", "dummy2"]
                }
            ]
        }
    ]
}

export const appCompsInvalidAppComponentDictionary : any = 
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
    appComponents: [
        {
            resourceId: "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web",
            kind: "app",
            resourceName: "test",
            metrics: [
                {
                    name: "123",
                    aggregation: "Average, min",
                    namespace: "dummy"
                }
            ]
        },
        "hi,123"
    ]
}

export const appCompsInvalidResourceIdString : any = 
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
    appComponents: [
        {
            resourceId: ["/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web"],
            kind: "app",
            resourceName: "test",
            metrics: [
                {
                    name: "123",
                    aggregation: "Average, min",
                    namespace: "dummy"
                }
            ]
        },
    ]
}
