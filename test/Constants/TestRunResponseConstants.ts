import { TestRunModel } from "../../src/models/PayloadModels"
import * as Constants from "./Constants"

export const testRunNonTerminalResponse: TestRunModel = {
    testRunId: Constants.loadtestConfig.testRunId,
    testId: Constants.loadtestConfig.testId,
    status: "ACCEPTED",
    startDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
}

export const testRunTerminalResponse: TestRunModel = {
    testRunId: Constants.loadtestConfig.testRunId,
    testId: Constants.loadtestConfig.testId,
    status: "DONE",
    startDateTime: Constants.loadtestConfig.sampleTimeStamp,
    endDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
}

export const testRunTerminalWithResultsResponse: TestRunModel = {
    testRunId: Constants.loadtestConfig.testRunId,
    testId: Constants.loadtestConfig.testId,
    status: "DONE",
    startDateTime: Constants.loadtestConfig.sampleTimeStamp,
    endDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
    passFailCriteria: {
        passFailMetrics: {
            "fefd759d-7fe8-4f83-8b6d-aeebe0f491fe": {
                clientMetric: "response_time_ms",
                aggregate: "percentage",
                condition: ">",
                value: 20,
                action: "continue",
                actualValue: 0,
                result: "PASSED",
            },
        },
    },
    testRunStatistics: {
        'Total': {
            errorCount: 10,
            errorPct: 10,
            minResTime: 10,
            maxResTime: 100,
            meanResTime: 50,
            medianResTime: 10,
            pct1ResTime: 20,
            pct2ResTime: 30,
            pct3ResTime: 40,
            pct75ResTime: 10,
            pct96ResTime: 30,
            pct98ResTime: 30,
            pct999ResTime: 30.10,
            pct9999ResTime: 30.4,
            sampleCount: 100,
            throughput: 100,
            transaction: 'Total',
        },
        'Sampler1': {
            errorCount: 10,
            errorPct: 10,
            minResTime: 10,
            maxResTime: 100,
            meanResTime: 50,
            medianResTime: 10,
            pct1ResTime: 20,
            pct2ResTime: 30,
            pct3ResTime: 40,
            pct75ResTime: 10,
            pct96ResTime: 30,
            pct98ResTime: 30,
            pct999ResTime: 30.10,
            pct9999ResTime: 30.4,
            sampleCount: 100,
            throughput: 100,
            transaction: 'Sampler1',
        }
    }
}

export const testRunTerminalWithResultsAndReportFilesResponse: TestRunModel = {
    testRunId: Constants.loadtestConfig.testRunId,
    testId: Constants.loadtestConfig.testId,
    status: "DONE",
    startDateTime: Constants.loadtestConfig.sampleTimeStamp,
    endDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
    passFailCriteria: {
        passFailMetrics: {
            "fefd759d-7fe8-4f83-8b6d-aeebe0f491fe": {
                clientMetric: "response_time_ms",
                aggregate: "percentage",
                condition: ">",
                value: 20,
                action: "continue",
                actualValue: 0,
                result: "PASSED",
            },
        },
    },
    testRunStatistics: {
        'Total': {
            errorCount: 10,
            errorPct: 10,
            minResTime: 10,
            maxResTime: 100,
            meanResTime: 50,
            medianResTime: 10,
            pct1ResTime: 20,
            pct2ResTime: 30,
            pct3ResTime: 40,
            pct75ResTime: 10,
            pct96ResTime: 30,
            pct98ResTime: 30,
            pct999ResTime: 30.10,
            pct9999ResTime: 30.4,
            sampleCount: 100,
            throughput: 100,
            transaction: 'Total',
        },
        'Sampler1': {
            errorCount: 10,
            errorPct: 10,
            minResTime: 10,
            maxResTime: 100,
            meanResTime: 50,
            medianResTime: 10,
            pct1ResTime: 20,
            pct2ResTime: 30,
            pct3ResTime: 40,
            pct75ResTime: 10,
            pct96ResTime: 30,
            pct98ResTime: 30,
            pct999ResTime: 30.10,
            pct9999ResTime: 30.4,
            sampleCount: 100,
            throughput: 100,
            transaction: 'Sampler1',
        }
    },
    testArtifacts: {
        inputArtifacts: {
            testScriptFileInfo: {
                url: "https://testurl",
                fileType: "JMX_FILE",
                fileName: "sample.jmx",
                validationStatus: "VALIDATION_SUCCESS",
            },
        },
        outputArtifacts: {
            reportFileInfo: {
                url: "https://testurl/report.zip",
                fileName: "report.zip",
            },
            resultFileInfo: {
                url: "https://testurl/testRun.zip",
                fileName: "testRun.zip",
            }
        }
    }
}

export const testRunFailedResponse: TestRunModel = {
    testRunId: Constants.loadtestConfig.testRunId,
    testId: Constants.loadtestConfig.testId,
    status: "FAILED",
    startDateTime: Constants.loadtestConfig.sampleTimeStamp,
    endDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
}

export const testRunResultFailedResponse: TestRunModel = {
    testRunId: Constants.loadtestConfig.testRunId,
    testId: Constants.loadtestConfig.testId,
    status: "DONE",
    testResult: "FAILED",
    startDateTime: Constants.loadtestConfig.sampleTimeStamp,
    endDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
}