export const publicTokenScope = "https://cnt-prod.loadtesting.azure.com";
export const usGovernmentTokenScope = "https://cnt-prod.loadtesting.azure.us";
export const armPublicTokenScope = "https://management.core.windows.net";
export const armUsGovernmentTokenScope = "https://management.usgovcloudapi.net";
export type ControlPlaneTokenScope = typeof armPublicTokenScope | typeof armUsGovernmentTokenScope;
export type DataPlaneTokenScope = typeof publicTokenScope | typeof usGovernmentTokenScope;

export type AccountType = 'Subscription' | 'Cloud'; // cloud is what the service principal logged into, should be only 1.

export interface TaskParameters {
    subscriptionId: string;
    subscriptionName: string;
    environment: string;
    armTokenScope: ControlPlaneTokenScope;
    dataPlaneTokenScope: DataPlaneTokenScope;
    resourceId: string;
    armEndpoint?: string;
}
