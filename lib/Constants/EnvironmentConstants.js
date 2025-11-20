"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureUSGovernmentCloud = exports.AzurePublicCloud = void 0;
const TaskParameters_1 = require("../models/TaskParameters");
exports.AzurePublicCloud = {
    cloudName: "AzureCloud",
    armTokenScope: TaskParameters_1.armPublicTokenScope,
    dataPlaneTokenScope: TaskParameters_1.publicTokenScope,
    armEndpoint: "https://management.azure.com",
};
exports.AzureUSGovernmentCloud = {
    cloudName: "AzureUSGovernment",
    armTokenScope: TaskParameters_1.armUsGovernmentTokenScope,
    dataPlaneTokenScope: TaskParameters_1.usGovernmentTokenScope,
};
