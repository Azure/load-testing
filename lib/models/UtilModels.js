"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConditionEnumToSignMap = exports.ValidCriteriaTypes = exports.ValidConditionsEnumValuesList = exports.OutPutVariablesConstants = exports.PostTaskParameters = exports.ManagedIdentityType = exports.ValidConditionList = exports.ValidAggregateList = exports.ApiVersionConstants = exports.correlationHeader = exports.resultZipFileName = exports.reportZipFileName = exports.resultFolder = exports.FileType = exports.ContentTypeMap = exports.FetchCallType = exports.TokenScope = exports.ReferenceIdentityKinds = exports.ParamType = void 0;
var ParamType;
(function (ParamType) {
    ParamType["env"] = "env";
    ParamType["secrets"] = "secrets";
    ParamType["cert"] = "cert";
})(ParamType = exports.ParamType || (exports.ParamType = {}));
var ReferenceIdentityKinds;
(function (ReferenceIdentityKinds) {
    ReferenceIdentityKinds["KeyVault"] = "KeyVault";
    ReferenceIdentityKinds["Metrics"] = "Metrics";
    ReferenceIdentityKinds["Engine"] = "Engine";
})(ReferenceIdentityKinds = exports.ReferenceIdentityKinds || (exports.ReferenceIdentityKinds = {}));
var TokenScope;
(function (TokenScope) {
    TokenScope[TokenScope["Dataplane"] = 0] = "Dataplane";
    TokenScope[TokenScope["ControlPlane"] = 1] = "ControlPlane";
})(TokenScope = exports.TokenScope || (exports.TokenScope = {}));
var FetchCallType;
(function (FetchCallType) {
    FetchCallType[FetchCallType["get"] = 0] = "get";
    FetchCallType[FetchCallType["patch"] = 1] = "patch";
    FetchCallType[FetchCallType["put"] = 2] = "put";
    FetchCallType[FetchCallType["delete"] = 3] = "delete";
    FetchCallType[FetchCallType["post"] = 4] = "post";
})(FetchCallType = exports.FetchCallType || (exports.FetchCallType = {}));
exports.ContentTypeMap = {
    [FetchCallType.get]: null,
    [FetchCallType.patch]: 'application/merge-patch+json',
    [FetchCallType.put]: 'application/octet-stream',
    [FetchCallType.delete]: 'application/json',
    [FetchCallType.post]: 'application/json'
};
var FileType;
(function (FileType) {
    FileType["JMX_FILE"] = "JMX_FILE";
    FileType["USER_PROPERTIES"] = "USER_PROPERTIES";
    FileType["ADDITIONAL_ARTIFACTS"] = "ADDITIONAL_ARTIFACTS";
    FileType["ZIPPED_ARTIFACTS"] = "ZIPPED_ARTIFACTS";
    FileType["URL_TEST_CONFIG"] = "URL_TEST_CONFIG";
    FileType["TEST_SCRIPT"] = "TEST_SCRIPT";
})(FileType = exports.FileType || (exports.FileType = {}));
exports.resultFolder = 'loadTest';
exports.reportZipFileName = 'report.zip';
exports.resultZipFileName = 'results.zip';
exports.correlationHeader = 'x-ms-correlation-request-id';
var ApiVersionConstants;
(function (ApiVersionConstants) {
    ApiVersionConstants.latestVersion = '2024-12-01-preview';
    ApiVersionConstants.tm2022Version = '2022-11-01';
    ApiVersionConstants.cp2022Version = '2022-12-01';
})(ApiVersionConstants = exports.ApiVersionConstants || (exports.ApiVersionConstants = {}));
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
})(ManagedIdentityType = exports.ManagedIdentityType || (exports.ManagedIdentityType = {}));
var PostTaskParameters;
(function (PostTaskParameters) {
    PostTaskParameters.runId = 'LOADTEST_RUNID';
    PostTaskParameters.baseUri = 'LOADTEST_RESOURCE_URI';
    PostTaskParameters.isRunCompleted = 'LOADTEST_RUN_COMPLETED'; // this is set when the task is completed, to avoid get calls for the test again.
})(PostTaskParameters = exports.PostTaskParameters || (exports.PostTaskParameters = {}));
var OutPutVariablesConstants;
(function (OutPutVariablesConstants) {
    OutPutVariablesConstants.testRunId = 'testRunId';
})(OutPutVariablesConstants = exports.OutPutVariablesConstants || (exports.OutPutVariablesConstants = {}));
var ValidConditionsEnumValuesList;
(function (ValidConditionsEnumValuesList) {
    ValidConditionsEnumValuesList["GreaterThan"] = "GreaterThan";
    ValidConditionsEnumValuesList["LessThan"] = "LessThan";
})(ValidConditionsEnumValuesList = exports.ValidConditionsEnumValuesList || (exports.ValidConditionsEnumValuesList = {}));
var ValidCriteriaTypes;
(function (ValidCriteriaTypes) {
    ValidCriteriaTypes["clientMetrics"] = "clientMetrics";
    ValidCriteriaTypes["serverMetrics"] = "serverMetrics";
})(ValidCriteriaTypes = exports.ValidCriteriaTypes || (exports.ValidCriteriaTypes = {}));
exports.ConditionEnumToSignMap = {
    [ValidConditionsEnumValuesList.GreaterThan]: '>',
    [ValidConditionsEnumValuesList.LessThan]: '<'
};
