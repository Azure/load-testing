"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedIdentityType = exports.ValidConditionList = exports.ValidAggregateList = exports.ApiVersionConstants = exports.correlationHeader = exports.resultZipFileName = exports.reportZipFileName = exports.resultFolder = exports.FileType = exports.ContentTypeMap = exports.CallTypeForDP = exports.TokenScope = exports.ParamType = void 0;
var ParamType;
(function (ParamType) {
    ParamType["env"] = "env";
    ParamType["secrets"] = "secrets";
    ParamType["cert"] = "cert";
})(ParamType || (exports.ParamType = ParamType = {}));
var TokenScope;
(function (TokenScope) {
    TokenScope[TokenScope["Dataplane"] = 0] = "Dataplane";
    TokenScope[TokenScope["ControlPlane"] = 1] = "ControlPlane";
})(TokenScope || (exports.TokenScope = TokenScope = {}));
var CallTypeForDP;
(function (CallTypeForDP) {
    CallTypeForDP[CallTypeForDP["get"] = 0] = "get";
    CallTypeForDP[CallTypeForDP["patch"] = 1] = "patch";
    CallTypeForDP[CallTypeForDP["put"] = 2] = "put";
    CallTypeForDP[CallTypeForDP["delete"] = 3] = "delete";
})(CallTypeForDP || (exports.CallTypeForDP = CallTypeForDP = {}));
exports.ContentTypeMap = {
    [CallTypeForDP.get]: null,
    [CallTypeForDP.patch]: 'application/merge-patch+json',
    [CallTypeForDP.put]: 'application/octet-stream',
    [CallTypeForDP.delete]: 'application/json'
};
var FileType;
(function (FileType) {
    FileType["JMX_FILE"] = "JMX_FILE";
    FileType["USER_PROPERTIES"] = "USER_PROPERTIES";
    FileType["ADDITIONAL_ARTIFACTS"] = "ADDITIONAL_ARTIFACTS";
    FileType["ZIPPED_ARTIFACTS"] = "ZIPPED_ARTIFACTS";
    FileType["URL_TEST_CONFIG"] = "URL_TEST_CONFIG";
    FileType["TEST_SCRIPT"] = "TEST_SCRIPT";
})(FileType || (exports.FileType = FileType = {}));
exports.resultFolder = 'loadTest';
exports.reportZipFileName = 'report.zip';
exports.resultZipFileName = 'results.zip';
exports.correlationHeader = 'x-ms-correlation-request-id';
var ApiVersionConstants;
(function (ApiVersionConstants) {
    ApiVersionConstants.tm2024Version = '2024-05-01-preview';
    ApiVersionConstants.tm2023Version = '2023-04-01-preview';
    ApiVersionConstants.tm2022Version = '2022-11-01';
    ApiVersionConstants.cp2022Version = '2022-12-01';
})(ApiVersionConstants || (exports.ApiVersionConstants = ApiVersionConstants = {}));
exports.ValidAggregateList = {
    'response_time_ms': ['avg', 'min', 'max', 'p50', 'p75', 'p90', 'p95', 'p96', 'p97', 'p98', 'p99', 'p999', 'p9999'],
    'requests_per_sec': ['avg'],
    'requests': ['count'],
    'latency': ['avg', 'min', 'max', 'p50', 'p75', 'p90', 'p95', 'p96', 'p97', 'p98', 'p99', 'p999', 'p9999'],
    'error': ['percentage']
};
exports.ValidConditionList = {
    'response_time_ms': ['>', '<'],
    'requests_per_sec': ['>', '<'],
    'requests': ['>', '<'],
    'latency': ['>', '<'],
    'error': ['>']
};
var ManagedIdentityType;
(function (ManagedIdentityType) {
    ManagedIdentityType["SystemAssigned"] = "SystemAssigned";
    ManagedIdentityType["UserAssigned"] = "UserAssigned";
})(ManagedIdentityType || (exports.ManagedIdentityType = ManagedIdentityType = {}));
