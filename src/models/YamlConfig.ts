// The model of the YAML file that the user provides to the task
export class YamlConfig
{
    version?: string ='';
    testId?: string = '';
    testName?: string = '';
    displayName?: string = '';
    description?: string = '';
    testPlan?: string = '';
    testType?: string = '';
    engineInstances?: number = 0;
    subnetId?: string = '';
    publicIPDisabled?: boolean = false;
    configurationFiles?: Array<string> = [];
    zipArtifacts?: Array<string> = [];
    splitAllCSVs?: boolean = false;
    properties?: { userPropertyFile: string } = { userPropertyFile: '' };
    env?: Array<{ name: string, value: string }> = [];
    certificates?: Array<{ name: string, value: string }> = [];
    secrets?: Array<{ name: string, value: string }> = [];
    failureCriteria?: any = [];
    appComponents?: Array<{resourceId: string, kind: string, metrics: Array<{name: string, aggregation: string, namespace?: string}>}> = [];
    autoStop?: { errorPercentage: number, timeWindow: number } = { errorPercentage: 0, timeWindow: 0 };
    keyVaultReferenceIdentity?: string = '';
    keyVaultReferenceIdentityType?: string = '';
    regionalLoadTestConfig?: Array<{region: string, engineInstances: number}> = [];
    referenceIdentities?: Array<{kind: string, type: string, value: string}> = [];
}