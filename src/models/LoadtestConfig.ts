import { AppComponentDefinition, AutoStopCriteria, CertificateMetadata, ManagedIdentityTypeForAPI, PassFailMetric, PassFailServerMetric, RegionConfiguration, ResourceMetricModel, SecretMetadata } from "./PayloadModels";
import { TestKind } from "./TestKind";

// The model after parsing the YAML file
export interface LoadtestConfig {
    testId: string;
    displayName: string;
    description?: string;
    testPlan: string;
    kind: TestKind;
    engineInstances: number;
    subnetId?: string;
    publicIPDisabled: boolean;
    configurationFiles: string[];
    zipArtifacts: string[];
    splitAllCSVs: boolean;
    propertyFile: string | null;
    environmentVariables: { [key: string]: string | null };
    certificates: CertificateMetadata | null;
    secrets: { [key: string] : SecretMetadata | null };

    failureCriteria: { [key: string]: number };
    serverFailureCriteria: PassFailServerMetric[];

    keyVaultReferenceIdentityType: ManagedIdentityTypeForAPI;
    metricsReferenceIdentityType: ManagedIdentityTypeForAPI;
    engineReferenceIdentityType: ManagedIdentityTypeForAPI;

    keyVaultReferenceIdentity: string | null;
    metricsReferenceIdentity: string | null;
    engineReferenceIdentities: string[] | null;

    autoStop: AutoStopCriteria | null;

    regionalLoadTestConfig: RegionConfiguration[] | null;

    appComponents: { [key: string] : AppComponentDefinition | null };
    serverMetricsConfig: { [key: string] :  ResourceMetricModel | null };

    addDefaultsForAppComponents: { [key: string]: boolean }; // when server components are not given for few app components, we need to add the defaults for this.
}