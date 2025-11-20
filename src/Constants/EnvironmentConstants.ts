import { ControlPlaneTokenScope, DataPlaneTokenScope, publicTokenScope, usGovernmentTokenScope, armUsGovernmentTokenScope, armPublicTokenScope } from "../models/TaskParameters";

type EnvironmentSettings = {
    cloudName: string;
    armTokenScope: ControlPlaneTokenScope;
    dataPlaneTokenScope: DataPlaneTokenScope;
    armEndpoint?: string;
}

export const AzurePublicCloud: EnvironmentSettings = {
    cloudName: "AzureCloud",
    armTokenScope: armPublicTokenScope,
    dataPlaneTokenScope: publicTokenScope,
    armEndpoint: "https://management.azure.com",
}

export const AzureUSGovernmentCloud: EnvironmentSettings = {
    cloudName: "AzureUSGovernment",
    armTokenScope: armUsGovernmentTokenScope,
    dataPlaneTokenScope: usGovernmentTokenScope,
}
