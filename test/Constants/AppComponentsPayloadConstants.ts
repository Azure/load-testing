import { AppComponents } from "../../src/models/PayloadModels";

export const createAppComponentsExpectedPayload: AppComponents = {
    components: {
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web': {
            resourceName: 'sample-web',
            kind: 'app, functionapp',
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        },
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz': {
            resourceName: 'xyz',
            kind: null,
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        }
    }
}

export const editAppComponentsResponse: AppComponents = {
    components: {
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web': {
            resourceName: 'sample-web',
            kind: 'app',
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        },
        'toberemoved': {
            resourceName: 'xyz',
            kind: null,
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        }
    }
}

export const editAppComponentsExpectedPayload: AppComponents = {
    components: {
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web': {
            resourceName: 'sample-web',
            kind: 'app, functionapp',
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        },
        '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz': {
            resourceName: 'xyz',
            kind: null,
            resourceType: 'microsoft.web/serverfarms',
            resourceId: '/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms/sample-web/xyz',
            subscriptionId: 'abcdef01-2345-6789-0abc-def012345678',
            resourceGroup: 'sample-rg'
        },
        'toberemoved': null
    }
}