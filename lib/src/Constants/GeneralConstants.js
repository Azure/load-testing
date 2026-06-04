"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputVariableName = exports.APIRoute = exports.autoStopDisable = exports.OverRideParametersModel = void 0;
const UtilModels_1 = require("../models/UtilModels");
class OverRideParametersModel {
    constructor() {
        this.testId = '';
        this.displayName = '';
        this.description = '';
        this.engineInstances = 0;
        this.autoStop = { errorPercentage: 0, timeWindow: 0 };
    }
}
exports.OverRideParametersModel = OverRideParametersModel;
exports.autoStopDisable = "disable";
var BaseAPIRoute;
(function (BaseAPIRoute) {
    BaseAPIRoute.featureFlag = "featureFlags";
})(BaseAPIRoute || (BaseAPIRoute = {}));
var APIRoute;
(function (APIRoute) {
    const latestVersion = "api-version=" + UtilModels_1.ApiVersionConstants.latestVersion;
    APIRoute.FeatureFlags = (flag) => `${BaseAPIRoute.featureFlag}/${flag}?${latestVersion}`;
})(APIRoute || (exports.APIRoute = APIRoute = {}));
exports.OutputVariableName = 'ALTOutputVar';
