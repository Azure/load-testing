import { ServerMetricConfig } from "../../src/models/PayloadModels";

export const createServerMetricConfigExpectedPayload: ServerMetricConfig = {
    metrics: {
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/cpupercentage': {
            name: 'CpuPercentage',
            aggregation: 'Average,Average',
            metricNamespace: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/cpupercentage'
        },
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/memorypercentage': {
            name: 'MemoryPercentage',
            aggregation: 'Average,Average',
            metricNamespace: 'Microsoft.Web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/memorypercentage'
        },
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz/microsoft.web/serverfarms/cpupercentage': {
            name: 'CpuPercentage',
            aggregation: 'Average',
            metricNamespace: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz/microsoft.web/serverfarms/cpupercentage'
        }
    }
}

export const editServerMetricConfigResponse: ServerMetricConfig = {
    metrics: {
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/cpupercentage': {
            name: 'CpuPercentage',
            aggregation: 'Max',
            metricNamespace: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/cpupercentage'
        },
        'toberemoved': {
            name: 'FakeMetric',
            aggregation: 'Average',
            metricNamespace: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz/microsoft.web/serverfarms/CpuPercentage'
        }
    }
}

export const editServerMetricConfigExpectedPayload: ServerMetricConfig = {                                                                                                                                                               
    metrics: {                                                                                                                                                    
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/cpupercentage': {                                                                                                                                                          
            name: 'CpuPercentage',
            aggregation: 'Average,Average',
            metricNamespace: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/cpupercentage'
        },
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/memorypercentage': {
            name: 'MemoryPercentage',
            aggregation: 'Average,Average',
            metricNamespace: 'Microsoft.Web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/microsoft.web/serverfarms/memorypercentage'
        },
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz/microsoft.web/serverfarms/cpupercentage': {
            name: 'CpuPercentage',
            aggregation: 'Average',
            metricNamespace: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz',
            resourceType: 'microsoft.web/serverfarms',
            id: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz/microsoft.web/serverfarms/cpupercentage'
        },
        'toberemoved': null
    }
}