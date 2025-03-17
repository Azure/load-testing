"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureUSGovernmentCloud = exports.AzurePublicCloud = void 0;
exports.AzurePublicCloud = {
    cloudName: "AzureCloud",
    armTokenScope: "https://management.core.windows.net",
    dataPlaneTokenScope: "https://loadtest.azure-dev.com",
    armEndpoint: "https://management.azure.com",
};
exports.AzureUSGovernmentCloud = {
    cloudName: "AzureUSGovernment",
    armTokenScope: "https://management.usgovcloudapi.net",
    dataPlaneTokenScope: "https://cnt-prod.loadtesting.azure.us",
};
