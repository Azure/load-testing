import { FileStatus, FileType, TestModel } from "../../src/models/PayloadModels"
import * as Constants from "./Constants"

export const testFileValidationPendingResponse: TestModel = {
    testId: Constants.loadtestConfig.testId,
    description: "sample test",
    displayName: Constants.loadtestConfig.testDisplayName,
    loadTestConfiguration: {
        engineInstances: 1
    },
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
    inputArtifacts: {
        testScriptFileInfo: {
            url: "https://testurl",
            fileType: FileType.JMX_FILE,
            fileName: "sample.jmx",
            validationStatus: FileStatus.VALIDATION_INITIATED,
        },
        additionalFileInfo: []
    }
}

export const testFileValidationCompletedResponse: TestModel = {
    testId: Constants.loadtestConfig.testId,
    description: "sample test",
    displayName: Constants.loadtestConfig.testDisplayName,
    loadTestConfiguration: {
        engineInstances: 1
    },
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
    inputArtifacts: {
        testScriptFileInfo: {
            url: "https://testurl",
            fileType: FileType.JMX_FILE,
            fileName: "sample.jmx",
            validationStatus: FileStatus.VALIDATION_SUCCESS,
        },
        additionalFileInfo: []
    }
}

export const testFileValidationFailedResponse: TestModel = {
    testId: Constants.loadtestConfig.testId,
    description: "sample test",
    displayName: Constants.loadtestConfig.testDisplayName,
    loadTestConfiguration: {
        engineInstances: 1
    },
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
    inputArtifacts: {
        testScriptFileInfo: {
            url: "https://testurl",
            fileType: FileType.JMX_FILE,
            fileName: "sample.jmx",
            validationStatus: FileStatus.VALIDATION_FAILURE,
            validationFailureDetails: "Error in file",
        },
        additionalFileInfo: []
    }
}

export const testAdditionalFileValidationFailedResponse: TestModel = {
    testId: Constants.loadtestConfig.testId,
    description: "sample test",
    displayName: Constants.loadtestConfig.testDisplayName,
    loadTestConfiguration: {
        engineInstances: 1
    },
    createdDateTime: Constants.loadtestConfig.sampleTimeStamp,
    createdBy: Constants.loadtestConfig.email,
    lastModifiedDateTime: Constants.loadtestConfig.sampleTimeStamp,
    lastModifiedBy: Constants.loadtestConfig.email,
    inputArtifacts: {
        testScriptFileInfo: {
            url: "https://testurl",
            fileType: FileType.JMX_FILE,
            fileName: "sample.jmx",
            validationStatus: FileStatus.VALIDATION_SUCCESS,
        },
        additionalFileInfo: [
            {
                url: "https://testurl",
                fileType: FileType.ADDITIONAL_ARTIFACTS,
                fileName: "sample1.jmx",
                validationStatus: FileStatus.VALIDATION_FAILURE,
                validationFailureDetails: "Error in file",
            }
        ]
    }
}