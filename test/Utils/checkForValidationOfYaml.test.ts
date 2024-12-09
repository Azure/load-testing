import { checkValidityYaml, getAllFileErrors } from '../../src/util'
import * as constants from './testYamls';

describe('invalid Yaml tests', () =>{
  describe('basic scenarios for invalid cases', ()=>{
    test('invalid YAML file', () => {
      expect(checkValidityYaml(constants.invalidYaml)).toStrictEqual({valid : false, error : 'Invalid YAML syntax.'});
    });
    test('unsupported YAML property', () => {
      expect(checkValidityYaml(constants.unsupportedFiled)).toStrictEqual({valid : false, error : 'The YAML file provided has unsupported field(s) "xyz, mohit".'});
    });
    test('testID is not present', () => {
      expect(checkValidityYaml(constants.noTestID)).toStrictEqual({valid : false, error : "The required field testId is missing in the load test YAML file."}); 
    });
    test('testID is invalid', () => {
      expect(checkValidityYaml(constants.invalidTestID)).toStrictEqual({valid : false, error : 'The value "moh1`2!" for testId is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.'}); 
    });
    test('no test plan', () => {
      expect(checkValidityYaml(constants.noTestPlan)).toStrictEqual({valid : false, error : 'The required field testPlan is missing in the load test YAML file.'}); 
    });  
    test('invalid display name', () => {
      expect(checkValidityYaml(constants.invalidDisplayName)).toStrictEqual({valid : false, error : 'The value "Sample TestSample TestSample TestSample TestSample TestSample Test" for displayName is invalid. Display name must be a string of length between 2 to 50.'}); 
    });
    test('invalid description', () => {
      expect(checkValidityYaml(constants.invalidDescription)).toStrictEqual({valid : false, error : 'The value "Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb" for description is invalid. Description must be a string of length less than 100.'}); 
    });
    test('invalid testType', () => {
      expect(checkValidityYaml(constants.invalidTestType)).toStrictEqual({valid : false, error : 'The value "Invalid" for testType is invalid. Acceptable values are URL, JMX and Locust.'});
    });
    test('invalid testPlan URL', () => {
      expect(checkValidityYaml(constants.wrongTestPlanURL)).toStrictEqual({valid : false, error : 'The testPlan for a URL test should of type "json".'});
    });
    test('invalid testPlan JMX', () => {
      expect(checkValidityYaml(constants.wrongTestPlanJMX)).toStrictEqual({valid : false, error : 'The testPlan for a JMX test should of type "jmx".'});
    });
    test('invalid testPlan Locust', () => {
      let expectedErr = 'The testPlan for a Locust test should of type "py".';
      expect(checkValidityYaml(constants.wrongTestPlanLocust)).toStrictEqual({valid : false, error : expectedErr});
    });
  });
  describe('engine instances inavlid tests', () => {
    test('invalid engines negative engines', () => {
      expect(checkValidityYaml(constants.invalidEngines1)).toStrictEqual({valid : false, error : 'The value "-1" for engineInstances is invalid. The value should be an integer between 1 and 400.'});
    });
    test('invalid engines more than max engines', () => {
      expect(checkValidityYaml(constants.invalidEngines2)).toStrictEqual({valid : false, error : 'The value "500" for engineInstances is invalid. The value should be an integer between 1 and 400.'});
    });
    test('invalid engines is not an integer', () => {
      expect(checkValidityYaml(constants.invalidEngines3)).toStrictEqual({valid : false, error : 'The value "mohit" for engineInstances is invalid. The value should be an integer between 1 and 400.'});
    });
  })
  describe('subnet is invalid', () => {
    test('invalid subnet subscription not present', () => {
      expect(checkValidityYaml(constants.invalidSubnet1)).toStrictEqual({valid : false, error : 'The value "/subscriptions/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".'});
    });
    test('invalid subnet resource group not valid', () => {
      expect(checkValidityYaml(constants.invalidSubnet2)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/{sample-rg1`!}/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".'});
    });
    test('invalid subnet vnet name not valid', () => {
      expect(checkValidityYaml(constants.invalidSubnet3)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg1()/providers/Microsoft.Network/virtualNetworks/load-())/subnets/load-testing" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".'});
    });
  })
  describe('key vault reference id is invalid', () => {
    test('invalid kvid', () => {
      expect(checkValidityYaml(constants.invalidKVID)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/{sample-rg1}/providers/Microsoft.Network/virtualNetworks/load-{}t/subnets/load-testing" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".'});
    });
    test('invalid kvidType', () => {
      expect(checkValidityYaml(constants.invalidKVIDType)).toStrictEqual({valid : false, error : 'The value "Invalid" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".'});
    });
    test('system assigned + kvid', () => {
      expect(checkValidityYaml(constants.systemAssignedNotValidForNonNullkvid)).toStrictEqual({valid : false, error : 'The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.'});
    });
    test('user assigned + no kvid', () => {
      expect(checkValidityYaml(constants.userAssignedNotValidForNullkvid)).toStrictEqual({valid : false, error : `"The value for 'keyVaultReferenceIdentity' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'keyVaultReferenceIdentity'."`});
    });
    test('public ip is invalid', () => {
      expect(checkValidityYaml(constants.invalidPublicIPDisabled)).toStrictEqual({valid : false, error : `The value "mohit" for publicIPDisabled is invalid. The value should be either true or false.`});
    });
  });
  test('public ip cannot be true when there is no subnet', () => {
    expect(checkValidityYaml(constants.publicIPDisabledTrueWithoutSubnet)).toStrictEqual({valid : false, error : `Public IP deployment can only be disabled for tests against private endpoints. For public endpoints, set publicIPDisabled to False.`});
  });
  test('config files property is invalid', () => {
    expect(checkValidityYaml(constants.invalidConfigFiles)).toStrictEqual({valid : false, error : `The value "sampledata.csv" for configurationFiles is invalid. Provide a valid list of strings.`});
  });
  test('zip files property is invalid', () => {
    expect(checkValidityYaml(constants.invalidZipFiles)).toStrictEqual({valid : false, error : `The value "bigdata.zip" for zipArtifacts is invalid. Provide a valid list of strings.`});
  });
  test('splitCSV is invalid', () => {
    expect(checkValidityYaml(constants.invalidSplitCSV)).toStrictEqual({valid : false, error : `The value "invalid" for splitAllCSVs is invalid. The value should be either true or false`});
  });
  describe('user prop invalid', () => {
    test('user prop is invalid', () => {
      expect(checkValidityYaml(constants.invalidUserProp)).toStrictEqual({valid : false, error : `The value "mohit.prop" for userPropertyFile is invalid. Provide a valid file path of type ".properties". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`});
    });
    test('user prop is invalid', () => {
      expect(checkValidityYaml(constants.invalidUserProp2)).toStrictEqual({valid : false, error : `The value "123" for userPropertyFile is invalid. Provide a valid file path of type ".properties". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`});
    });
    test('user prop is invalid for Locust', () => {
      let expectedErr = `The value "invalid.properties" for userPropertyFile is invalid. Provide a valid file path of type ".conf", ".toml" or ".ini". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`;
      expect(checkValidityYaml(constants.invalidUserProp3)).toStrictEqual({valid : false, error : expectedErr});
    });
  });
  describe('auto stop invalid cases', () => {
    test('auto stop disable is invalid', () => {
      expect(checkValidityYaml(constants.invalidAutoStop1)).toStrictEqual({valid : false, error : `Invalid value for "autoStop", for disabling auto stop use "autoStop: disable"`});
    });
    test('auto stop enable is invalid for error percentage', () => {
      expect(checkValidityYaml(constants.invalidAutoStop2)).toStrictEqual({valid : false, error : `The value "-1.1" for errorPercentage of auto-stop criteria is invalid. The value should be valid decimal number from 0 to 100.`});
    });
    test('auto stop enable is invalid for time range', () => {
      expect(checkValidityYaml(constants.invalidAutoStop3)).toStrictEqual({valid : false, error : `The value "-100.01" for timeWindow of auto-stop criteria is invalid. The value should be valid integer greater than 0.`});
    });
  });
  describe('Multi region config invalid scenarios', () => {
    test('Invalid regional engine instance', () => {
      expect(checkValidityYaml(constants.multiRegionConfigTestInvalidEngineInstances)).toStrictEqual({valid : false, error : `The value "-1" for engineInstances in regionalLoadTestConfig is invalid. The value should be an integer between 1 and 400.`});
    });
    test('Null region value', () => {
      expect(checkValidityYaml(constants.multiRegionConfigTestNullRegion)).toStrictEqual({valid : false, error : `The value "null" for region in regionalLoadTestConfig is invalid. Provide a valid string.`});
    });
    test('Empty region value', () => {
      expect(checkValidityYaml(constants.multiRegionConfigTestEmptyRegion)).toStrictEqual({valid : false, error : `The value "" for region in regionalLoadTestConfig is invalid. Provide a valid string.`});
    });
    test('Invalid engine instance sum', () => {
      expect(checkValidityYaml(constants.multiRegionConfigTestInvalidEngineInstanceSum)).toStrictEqual({valid : false, error : `The sum of engineInstances in regionalLoadTestConfig should be equal to the value of totalEngineInstances "1" in the test configuration.`});
    });
    test('Invalid number of regions', () => {
      expect(checkValidityYaml(constants.multiRegionConfigTestInvalidNumberOfRegions)).toStrictEqual({valid : false, error : `Multi-region load tests should contain a minimum of 2 geographic regions in the configuration.`});
    });
  });
})

describe('valid yaml tests', () => {
  test('check for basic yaml', () => {
    expect(checkValidityYaml(constants.basicYaml)).toStrictEqual({valid : true, error : ""});
  });
  test('check for case sensitivity in yaml', () => {
    expect(checkValidityYaml(constants.caseSensitiveYaml)).toStrictEqual({valid : true, error : ""});
  });
  test('URL test', () => {
    expect(checkValidityYaml(constants.urlYaml)).toStrictEqual({valid : true, error : ""});
  });
  test('Locust test', () => {
    let expectedErr = {valid : true, error : ""};
    expect(checkValidityYaml(constants.locustYaml)).toStrictEqual(expectedErr);
  });
  test('subnet id and PIP is true', () => {
    expect(checkValidityYaml(constants.subnetIdPIPDisabledTrue)).toStrictEqual({valid : true, error : ""});
  });
})

describe('file errors', () => {
  test('Test object with no file validation errors', () => {
    // https://learn.microsoft.com/en-us/rest/api/loadtesting/dataplane/load-test-administration/get-test?view=rest-loadtesting-dataplane-2022-11-01&tabs=HTTP
    let testObj = {
      "testId": "12345678-1234-1234-1234-123456789012",
      "description": "sample description",
      "displayName": "Performance_LoadTest",
      "loadTestConfiguration": {
        "engineInstances": 6,
        "splitAllCSVs": true
      },
      "passFailCriteria": {
        "passFailMetrics": {
          "fefd759d-7fe8-4f83-8b6d-aeebe0f491fe": {
            "clientMetric": "response_time_ms",
            "aggregate": "percentage",
            "condition": ">",
            "value": 20,
            "action": "continue",
            "actualValue": 0,
            "result": null
          }
        }
      },
      "createdDateTime": "2021-12-05T16:43:46.072Z",
      "createdBy": "user@contoso.com",
      "lastModifiedDateTime": "2021-12-05T16:43:46.072Z",
      "lastModifiedBy": "user@contoso.com",
      "inputArtifacts": {
        "configFileInfo": {
          "url": "https://dummyurl.com/configresource",
          "fileName": "config.yaml",
          "fileType": "ADDITIONAL_ARTIFACTS",
          "expireDateTime": "2021-12-05T16:43:46.072Z",
          "validationStatus": ""
        },
        "testScriptFileInfo": {
          "url": "https://dummyurl.com/testscriptresource",
          "fileName": "sample.jmx",
          "fileType": "JMX_FILE",
          "expireDateTime": "2021-12-05T16:43:46.072Z",
          "validationStatus": "VALIDATION_SUCCESS"
        },
        "userPropFileInfo": {
          "url": "https://dummyurl.com/userpropresource",
          "fileName": "user.properties",
          "fileType": "USER_PROPERTIES",
          "expireDateTime": "2021-12-05T16:43:46.072Z",
          "validationStatus": ""
        },
        "inputArtifactsZipFileInfo": {
          "url": "https://dummyurl.com/inputartifactzipresource",
          "fileName": "inputartifacts.zip",
          "fileType": "ADDITIONAL_ARTIFACTS",
          "expireDateTime": "2021-12-05T16:43:46.072Z",
          "validationStatus": ""
        },
        "additionalFileInfo": []
      },
      "secrets": {
        "secret1": {
          "value": "https://samplevault.vault.azure.net/secrets/samplesecret/f113f91fd4c44a368049849c164db827",
          "type": "AKV_SECRET_URI"
        }
      },
      "environmentVariables": {
        "envvar1": "sampletext"
      },
      "subnetId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.Network/virtualNetworks/samplenetworkresource/subnets/AAAAA0A0A0",
      "keyvaultReferenceIdentityType": "UserAssigned",
      "keyvaultReferenceIdentityId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1"
    }
    expect(getAllFileErrors(testObj)).toStrictEqual({});
  });

  test('Test object with file validation errors', () => {
    // https://learn.microsoft.com/en-us/rest/api/loadtesting/dataplane/load-test-administration/get-test?view=rest-loadtesting-dataplane-2022-11-01&tabs=HTTP
    let testObj = {
      "testId": "12345678-1234-1234-1234-123456789012",
      "description": "sample description",
      "displayName": "Performance_LoadTest",
      "loadTestConfiguration": {
        "engineInstances": 6,
        "splitAllCSVs": true
      },
      "passFailCriteria": {
        "passFailMetrics": {
          "fefd759d-7fe8-4f83-8b6d-aeebe0f491fe": {
            "clientMetric": "response_time_ms",
            "aggregate": "percentage",
            "condition": ">",
            "value": 20,
            "action": "continue",
            "actualValue": 0,
            "result": null
          }
        }
      },
      "createdDateTime": "2021-12-05T16:43:46.072Z",
      "createdBy": "user@contoso.com",
      "lastModifiedDateTime": "2021-12-05T16:43:46.072Z",
      "lastModifiedBy": "user@contoso.com",
      "inputArtifacts": {
        "testScriptFileInfo": {
          "url": "https://dummyurl.com/testscriptresource",
          "fileName": "sample.jmx",
          "fileType": "JMX_FILE",
          "expireDateTime": "2021-12-05T16:43:46.072Z",
          "validationStatus": "VALIDATION_SUCCESS"
        },
        "userPropFileInfo": {
          "url": "https://dummyurl.com/userpropresource",
          "fileName": "user.properties",
          "fileType": "USER_PROPERTIES",
          "expireDateTime": "2021-12-05T16:43:46.072Z",
          "validationStatus": ""
        },
        "additionalFileInfo": [
          {
            "url": "https://dummyurl.com/inputartifactzipresource",
            "fileName": "inputartifacts.zip",
            "fileType": "ZIPPED_ARTIFACTS",
            "expireDateTime": "2021-12-05T16:43:46.072Z",
            "validationStatus": "VALIDATION_FAILURE",
            "validationFailureDetails": "Error in zip"
          },
          {
            "url": "https://dummyurl.com/inputartifactresource",
            "fileName": "fragment.jmx",
            "fileType": "ADDITIONAL_ARTIFACTS",
            "expireDateTime": "2021-12-05T16:43:46.072Z",
            "validationStatus": "VALIDATION_FAILURE",
            "validationFailureDetails": "Error in fragment"
          },
        ]
      },
      "secrets": {
        "secret1": {
          "value": "https://samplevault.vault.azure.net/secrets/samplesecret/f113f91fd4c44a368049849c164db827",
          "type": "AKV_SECRET_URI"
        }
      },
      "environmentVariables": {
        "envvar1": "sampletext"
      },
      "subnetId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.Network/virtualNetworks/samplenetworkresource/subnets/AAAAA0A0A0",
      "keyvaultReferenceIdentityType": "UserAssigned",
      "keyvaultReferenceIdentityId": "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/samplerg/providers/Microsoft.ManagedIdentity/userAssignedIdentities/identity1"
    }
    expect(getAllFileErrors(testObj)).toStrictEqual({
      "inputartifacts.zip": "Error in zip",
      "fragment.jmx": "Error in fragment"
    });
  })
})