export const UndefinedMaxVUAutostop : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    autoStop: {
        errorPercentage: 80,
        timeWindow: 60,
        maximumVirtualUsersPerEngine: undefined,
    }
}

export const MissingKeyMaxVUAutostop : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    autoStop: {
        errorPercentage: 80,
        timeWindow: 60,
    }
}

export const NullMaxVUAutostop : any = 
{
    version: 'v0.1',
    testId: 'SampleTest',
    testName: 'SampleTest',
    displayName: 'Sample Test',
    description: 'Load test website home page',
    testPlan: 'SampleTest.jmx',
    testType: 'JMX',
    engineInstances: 2,
    autoStop: {
        errorPercentage: 80,
        timeWindow: 60,
        maximumVirtualUsersPerEngine: null,
    }
}
