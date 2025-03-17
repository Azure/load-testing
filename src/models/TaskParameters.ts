export interface TaskParameters {
    subscriptionId: string;
    environment: string;
    armTokenScope: string;
    dataPlaneTokenScope: string;
    resourceId: string;
    serviceConnectionName: string;
    authorizationScheme: string;
    armEndpoint?: string;
    authorityHostUrl?: string;
}