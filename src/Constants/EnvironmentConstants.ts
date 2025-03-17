type EnvironmentSettings = {
    cloudName: string;
    armTokenScope: string;
    dataPlaneTokenScope: string;
    armEndpoint?: string;
}

export const AzurePublicCloud: EnvironmentSettings = {
    cloudName: "AzureCloud",
    armTokenScope: "https://management.core.windows.net",
    dataPlaneTokenScope: "https://loadtest.azure-dev.com",
    armEndpoint: "https://management.azure.com",
}

export const AzureUSGovernmentCloud: EnvironmentSettings = {
    cloudName: "AzureUSGovernment",
    armTokenScope: "https://management.usgovcloudapi.net",
    dataPlaneTokenScope: "https://cnt-prod.loadtesting.azure.us",
}