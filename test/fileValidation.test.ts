import { getAllFileErrors } from "../src/Utils/CommonUtils";

describe("file errors", () => {
	test("Test object with no file validation errors", () => {
		// https://learn.microsoft.com/en-us/rest/api/loadtesting/dataplane/load-test-administration/get-test?view=rest-loadtesting-dataplane-2022-11-01&tabs=HTTP
		let testObj = {
			testId: "12345678-1234-1234-1234-123456789012",
			description: "sample description",
			displayName: "Performance_LoadTest",
			loadTestConfiguration: {
				engineInstances: 6,
				splitAllCSVs: true,
			},
			passFailCriteria: {
				passFailMetrics: {
					"fefd759d-7fe8-4f83-8b6d-aeebe0f491fe": {
						clientMetric: "response_time_ms",
						aggregate: "percentage",
						condition: ">",
						value: 20,
						action: "continue",
						actualValue: 0,
						result: null,
					},
				},
			},
			createdDateTime: "2021-12-05T16:43:46.072Z",
			createdBy: "user@contoso.com",
			lastModifiedDateTime: "2021-12-05T16:43:46.072Z",
			lastModifiedBy: "user@contoso.com",
			inputArtifacts: {
				configFileInfo: {
					url: "https://dummyurl.com/configresource",
					fileName: "config.yaml",
					fileType: "ADDITIONAL_ARTIFACTS",
					expireDateTime: "2021-12-05T16:43:46.072Z",
					validationStatus: "",
				},
				testScriptFileInfo: {
					url: "https://dummyurl.com/testscriptresource",
					fileName: "sample.jmx",
					fileType: "JMX_FILE",
					expireDateTime: "2021-12-05T16:43:46.072Z",
					validationStatus: "VALIDATION_SUCCESS",
				},
				userPropFileInfo: {
					url: "https://dummyurl.com/userpropresource",
					fileName: "user.properties",
					fileType: "USER_PROPERTIES",
					expireDateTime: "2021-12-05T16:43:46.072Z",
					validationStatus: "",
				},
				inputArtifactsZipFileInfo: {
					url: "https://dummyurl.com/inputartifactzipresource",
					fileName: "inputartifacts.zip",
					fileType: "ADDITIONAL_ARTIFACTS",
					expireDateTime: "2021-12-05T16:43:46.072Z",
					validationStatus: "",
				},
				additionalFileInfo: [],
			},
			secrets: {
				secret1: {
					value:
					"https://samplevault.vault.azure.net/secrets/samplesecret/f113f91fd4c44a368049849c164db827",
					type: "AKV_SECRET_URI",
				},
			},
			environmentVariables: {
				envvar1: "sampletext",
			},
			subnetId:
			"/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.Network/virtualNetworks/samplenetworkresource/subnets/AAAAA0A0A0",
			keyvaultReferenceIdentityType: "UserAssigned",
			keyvaultReferenceIdentityId:
			"/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1",
		};
		expect(getAllFileErrors(testObj)).toStrictEqual({});
	});
	
	test("Test object with file validation errors", () => {
		// https://learn.microsoft.com/en-us/rest/api/loadtesting/dataplane/load-test-administration/get-test?view=rest-loadtesting-dataplane-2022-11-01&tabs=HTTP
		let testObj = {
			testId: "12345678-1234-1234-1234-123456789012",
			description: "sample description",
			displayName: "Performance_LoadTest",
			loadTestConfiguration: {
				engineInstances: 6,
				splitAllCSVs: true,
			},
			passFailCriteria: {
				passFailMetrics: {
					"fefd759d-7fe8-4f83-8b6d-aeebe0f491fe": {
						clientMetric: "response_time_ms",
						aggregate: "percentage",
						condition: ">",
						value: 20,
						action: "continue",
						actualValue: 0,
						result: null,
					},
				},
			},
			createdDateTime: "2021-12-05T16:43:46.072Z",
			createdBy: "user@contoso.com",
			lastModifiedDateTime: "2021-12-05T16:43:46.072Z",
			lastModifiedBy: "user@contoso.com",
			inputArtifacts: {
				testScriptFileInfo: {
					url: "https://dummyurl.com/testscriptresource",
					fileName: "sample.jmx",
					fileType: "JMX_FILE",
					expireDateTime: "2021-12-05T16:43:46.072Z",
					validationStatus: "VALIDATION_SUCCESS",
				},
				userPropFileInfo: {
					url: "https://dummyurl.com/userpropresource",
					fileName: "user.properties",
					fileType: "USER_PROPERTIES",
					expireDateTime: "2021-12-05T16:43:46.072Z",
					validationStatus: "",
				},
				additionalFileInfo: [
					{
						url: "https://dummyurl.com/inputartifactzipresource",
						fileName: "inputartifacts.zip",
						fileType: "ZIPPED_ARTIFACTS",
						expireDateTime: "2021-12-05T16:43:46.072Z",
						validationStatus: "VALIDATION_FAILURE",
						validationFailureDetails: "Error in zip",
					},
					{
						url: "https://dummyurl.com/inputartifactresource",
						fileName: "fragment.jmx",
						fileType: "ADDITIONAL_ARTIFACTS",
						expireDateTime: "2021-12-05T16:43:46.072Z",
						validationStatus: "VALIDATION_FAILURE",
						validationFailureDetails: "Error in fragment",
					},
				],
			},
			secrets: {
				secret1: {
					value:
					"https://samplevault.vault.azure.net/secrets/samplesecret/f113f91fd4c44a368049849c164db827",
					type: "AKV_SECRET_URI",
				},
			},
			environmentVariables: {
				envvar1: "sampletext",
			},
			subnetId:
			"/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.Network/virtualNetworks/samplenetworkresource/subnets/AAAAA0A0A0",
			keyvaultReferenceIdentityType: "UserAssigned",
			keyvaultReferenceIdentityId:
			"/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1",
		};
		expect(getAllFileErrors(testObj)).toStrictEqual({
			"inputartifacts.zip": "Error in zip",
			"fragment.jmx": "Error in fragment",
		});
	});
});
