export interface TaskParameters {
    subscriptionId: string;
    subscriptionName: string;
    environment: string;
    armTokenScope: string;
    dataPlaneTokenScope: string;
    resourceId: string;
    armEndpoint?: string;
}