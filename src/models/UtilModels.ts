import { SecretMetadata } from "./PayloadModels";

export interface AutoStopCriteriaObjYaml {
    autoStopEnabled? : boolean;
    errorPercentage ?: number;
    timeWindow ?: number;
}

export enum ParamType {
    env = "env",
    secrets = "secrets", 
    cert = "cert"
}

export interface RunTimeParams {
    env: { [key: string]: string };
    secrets: { [key: string] : SecretMetadata };
    runDisplayName: string;
    runDescription: string;
    testRunId: string;
    testId: string;
}

export enum ReferenceIdentityKinds {
    KeyVault = "KeyVault",
    Metrics = "Metrics",
    Engine = "Engine"
}

export enum TokenScope {
    Dataplane,
    ControlPlane
}

export enum CallTypeForDP {
    get,
    patch,
    put,
    delete
}

export interface PassFailCount {
    pass: number;
    fail: number;
}

export const ContentTypeMap : { [key in CallTypeForDP]: string | null } = {
    [CallTypeForDP.get]: null,
    [CallTypeForDP.patch]: 'application/merge-patch+json',
    [CallTypeForDP.put]: 'application/octet-stream',
    [CallTypeForDP.delete]: 'application/json'
}

export enum FileType{
    JMX_FILE = 'JMX_FILE',
    USER_PROPERTIES = 'USER_PROPERTIES',
    ADDITIONAL_ARTIFACTS = 'ADDITIONAL_ARTIFACTS',
    ZIPPED_ARTIFACTS = "ZIPPED_ARTIFACTS",
    URL_TEST_CONFIG = "URL_TEST_CONFIG",
    TEST_SCRIPT = 'TEST_SCRIPT',
}

export const resultFolder = 'loadTest';
export const reportZipFileName = 'report.zip';
export const resultZipFileName = 'results.zip';
export const correlationHeader = 'x-ms-correlation-request-id';

export module ApiVersionConstants {
    export const latestVersion = '2024-12-01-preview';
    export const tm2022Version = '2022-11-01';
    export const cp2022Version = '2022-12-01'
}

export const ValidAggregateList = {
    'response_time_ms': ['avg', 'min', 'max', 'p50', 'p75', 'p90', 'p95', 'p96', 'p97', 'p98', 'p99', 'p999', 'p9999'],
    'requests_per_sec': ['avg'],
    'requests': ['count'],
    'latency': ['avg', 'min', 'max', 'p50', 'p75', 'p90', 'p95', 'p96', 'p97', 'p98', 'p99', 'p999', 'p9999'],
    'error': ['percentage']
}

export const ValidConditionList = {
    'response_time_ms': ['>', '<'],
    'requests_per_sec': ['>', '<'],
    'requests': ['>', '<'],
    'latency': ['>', '<'],
    'error': ['>']
}

export enum ManagedIdentityType {
    SystemAssigned = "SystemAssigned",
    UserAssigned = "UserAssigned",
}

export interface ServerMetricsClientModel {
    name: string;
    aggregation: string;
    namespace?: string;
}

export interface AllManagedIdentitiesSegregated {
    referenceIdentityValuesUAMIMap: { [key in ReferenceIdentityKinds]: string[] },
    referenceIdentiesSystemAssignedCount : { [key in ReferenceIdentityKinds]: number }
}

export interface ValidationModel {
    valid: boolean;
    error: string;
}