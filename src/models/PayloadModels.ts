import { TestKind } from "./engine/TestKind";

export class CertificateMetadata {
    type?: string;
    value?: string;
    name?: string;
};

export interface RegionConfiguration {
    region: string;
    engineInstances: number;
};

export interface SecretMetadata {
    type: string;
    value: string;
};

export interface PassFailMetric {
    aggregate: string;
    clientMetric: string;
    condition?: string;
    action?: string | null;
    requestName?: string | null;
    value?: number;
    actualValue?: number;
    result?: string | null;
};

export interface PassFailServerMetric {
    metricNameSpace: string | null;
    metricName: string;
    resourceId: string;
    aggregation: string;
    condition: string;
    value: string;
}

export interface AppComponentDefinition {
    resourceName: string;
    kind: string | null;
    resourceId: string;
    resourceType: string;
    subscriptionId: string;
    resourceGroup: string;
}

export interface AppComponents {
    components: {[key: string]: AppComponentDefinition | null};
}

export interface ServerMetricConfig {
    metrics: { [key: string]: ResourceMetricModel | null };
}

export interface ResourceMetricModel {
    name: string| null;
    aggregation: string;
    metricNamespace : string | null;
    resourceId: string;
    resourceType: string| null;
    id: string;
}

export interface TestModel {
    testId?: string;
    description?: string;
    displayName?: string;
    loadTestConfiguration?: LoadTestConfiguration;
    passFailCriteria?: PassFailCriteria;
    autoStopCriteria?: AutoStopCriteria | null;
    createdDateTime?: string;
    createdBy?: string;
    lastModifiedDateTime?: string;
    lastModifiedBy?: string;
    inputArtifacts?: InputArtifacts;
    secrets?: { [key: string]: SecretMetadata | null };
    certificate?: CertificateMetadata | null;
    environmentVariables?: { [key: string]: string | null };
    subnetId?: string;
    publicIPDisabled?: boolean;
    keyvaultReferenceIdentityType?: string;
    keyvaultReferenceIdentityId?: string| null;
    metricsReferenceIdentityType?: string;
    metricsReferenceIdentityId?: string | null;
    engineBuiltinIdentityType?: string;
    engineBuiltinIdentityIds?: string[] | null;
    baselineTestRunId?: string;
    kind?: TestKind;
};

export interface TestRunArtifacts {
    inputArtifacts: InputArtifacts;
    outputArtifacts: OutputArtifacts;
}

export interface TestRunModel extends TestModel {
    testRunId: string;
    errorDetails? : any;
    testArtifacts?: TestRunArtifacts;
    testResult?: string;
    status?: string;
    testRunStatistics? : { [ key: string ] : Statistics };
    virtualUserHours?: number;
    virtualUsers?: number;
    startDateTime?: string;
    endDateTime?: string;
    portalUrl?: string;
}

export interface Statistics {
    errorCount?: number;
    errorPct?: number;
    minResTime?: number;
    maxResTime?: number;
    meanResTime?: number;
    medianResTime?: number;
    pct1ResTime?: number;
    pct2ResTime?: number;
    pct3ResTime?: number;
    pct75ResTime?: number;
    pct96ResTime?: number;
    pct98ResTime?: number;
    pct999ResTime?: number;
    pct9999ResTime?: number;
    sampleCount?: number;
    throughput?: number;
    transaction?: string;
}

export interface AutoStopCriteria {
    autoStopDisabled? : boolean;
    errorRate ?: number;
    errorRateTimeWindowInSeconds ?: number;
}

export interface LoadTestConfiguration {
    engineInstances?: number;
    splitAllCSVs?: boolean;
    quickStartTest?: boolean;
    regionalLoadTestConfig?: RegionConfiguration[] | null;
};

export interface PassFailCriteria {
    passFailMetrics?: { [key: string]: PassFailMetric | null };
    passFailServerMetrics?: { [key: string]: PassFailServerMetric | null };
};

export interface InputArtifacts {
    configFileInfo?: FileInfo;
    testScriptFileInfo?: FileInfo;
    additionalFileInfo?: FileInfo[];
    inputArtifactsZipFileInfo? : FileInfo;
    userPropFileInfo?: FileInfo;
    urlTestConfigFileInfo? : FileInfo;
};

export interface OutputArtifacts {
    reportFileInfo?: FileInfo;
    resultFileInfo?: FileInfo;
    logsFileInfo?: FileInfo;
    artifactsContainerInfo?: FileInfo;
}

export interface FileInfo {
    url?: string;
    fileName?: string;
    expireDateTime?: string;
    fileType?: string;
    validationStatus?: string;
    validationFailureDetails?: string;
};

export interface ExistingParams {
    secrets: { [key: string]: SecretMetadata | null };
    env: { [key: string]: string | null };
    passFailCriteria: { [key: string]: PassFailMetric | null };
    passFailServerMetrics: { [key: string]: PassFailServerMetric | null };
    appComponents: Map<string, string[]>; // key: resourceId, value: guids of the app components, so that we can make them null when the resourceId is removed from the config file.
}

export enum ManagedIdentityTypeForAPI {
    SystemAssigned = "SystemAssigned",
    UserAssigned = "UserAssigned",
    None = "None"
}