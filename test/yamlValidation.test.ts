import * as constants from './Constants/testYamls';
import * as referenceIdentityConstants from './Constants/ReferenceIdentityYamls';
import * as appCompsConstants from './Constants/AppComponentsAndServerConfigYamls';
import * as passFailCriteriaConstants from './Constants/FailureCriteriaYamls';
import { validateYamlConfig } from '../src/Utils/YamlValidationUtil';

describe('invalid Yaml tests', () =>{
	describe('basic scenarios for invalid cases', ()=>{
		test('invalid YAML file', () => {
			expect(validateYamlConfig(constants.invalidYaml)).toStrictEqual({valid : false, error : 'Invalid YAML syntax.'});
		});
		test('unsupported YAML property', () => {
			expect(validateYamlConfig(constants.unsupportedFiled)).toStrictEqual({valid : false, error : 'The YAML file provided has unsupported field(s) "xyz, mohit".'});
		});
		test('testID is not present', () => {
			expect(validateYamlConfig(constants.noTestID)).toStrictEqual({valid : false, error : "The required field testId is missing in the load test YAML file."}); 
		});
		test('testID is invalid', () => {
			expect(validateYamlConfig(constants.invalidTestID)).toStrictEqual({valid : false, error : 'The value "moh1`2!" for testId is not a valid string. Allowed characters are [a-zA-Z0-9-_] and the length must be between 2 to 50 characters.'}); 
		});
		test('no test plan', () => {
			expect(validateYamlConfig(constants.noTestPlan)).toStrictEqual({valid : false, error : 'The required field testPlan is missing in the load test YAML file.'}); 
		});  
		test('invalid display name', () => {
			expect(validateYamlConfig(constants.invalidDisplayName)).toStrictEqual({valid : false, error : 'The value "Sample TestSample TestSample TestSample TestSample TestSample Test" for displayName is invalid. Display name must be a string of length between 2 to 50.'}); 
		});
		test('invalid description', () => {
			expect(validateYamlConfig(constants.invalidDescription)).toStrictEqual({valid : false, error : 'The value "Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb Load test website home page bvfjnabgoidvcb" for description is invalid. Description must be a string of length less than 100.'}); 
		});
		test('invalid testType', () => {
			expect(validateYamlConfig(constants.invalidTestType)).toStrictEqual({valid : false, error : 'The value "Invalid" for testType is invalid. Acceptable values are URL, JMX and Locust.'});
		});
		test('invalid testPlan URL', () => {
			expect(validateYamlConfig(constants.wrongTestPlanURL)).toStrictEqual({valid : false, error : 'The testPlan for a URL test should of type "json".'});
		});
		test('invalid testPlan JMX', () => {
			expect(validateYamlConfig(constants.wrongTestPlanJMX)).toStrictEqual({valid : false, error : 'The testPlan for a JMX test should of type "jmx".'});
		});
		test('invalid testPlan Locust', () => {
			let expectedErr = 'The testPlan for a Locust test should of type "py".';
			expect(validateYamlConfig(constants.wrongTestPlanLocust)).toStrictEqual({valid : false, error : expectedErr});
		});
	});
	describe('engine instances inavlid tests', () => {
		test('invalid engines negative engines', () => {
			expect(validateYamlConfig(constants.invalidEngines1)).toStrictEqual({valid : false, error : 'The value "-1" for engineInstances is invalid. The value should be an integer between 1 and 400.'});
		});
		test('invalid engines more than max engines', () => {
			expect(validateYamlConfig(constants.invalidEngines2)).toStrictEqual({valid : false, error : 'The value "500" for engineInstances is invalid. The value should be an integer between 1 and 400.'});
		});
		test('invalid engines is not an integer', () => {
			expect(validateYamlConfig(constants.invalidEngines3)).toStrictEqual({valid : false, error : 'The value "mohit" for engineInstances is invalid. The value should be an integer between 1 and 400.'});
		});
	})
	describe('subnet is invalid', () => {
		test('invalid subnet subscription not present', () => {
			expect(validateYamlConfig(constants.invalidSubnet1)).toStrictEqual({valid : false, error : 'The value "/subscriptions/resourceGroups/sample-rg/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".'});
		});
		test('invalid subnet resource group not valid', () => {
			expect(validateYamlConfig(constants.invalidSubnet2)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/{sample-rg1`!}/providers/Microsoft.Network/virtualNetworks/load-testing-vnet/subnets/load-testing" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".'});
		});
		test('invalid subnet vnet name not valid', () => {
			expect(validateYamlConfig(constants.invalidSubnet3)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg1()/providers/Microsoft.Network/virtualNetworks/load-())/subnets/load-testing" for subnetId is invalid. The value should be a string of the format: "/subscriptions/{subscriptionId}/resourceGroups/{rgName}/providers/Microsoft.Network/virtualNetworks/{vnetName}/subnets/{subnetName}".'});
		});
	})
	describe('key vault reference id is invalid', () => {
		test('invalid kvid', () => {
			expect(validateYamlConfig(constants.invalidKVID)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/{sample-rg1}/providers/Microsoft.Network/virtualNetworks/load-{}t/subnets/load-testing" for keyVaultReferenceIdentity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".'});
		});
		test('invalid kvidType', () => {
			expect(validateYamlConfig(constants.invalidKVIDType)).toStrictEqual({valid : false, error : 'The value "Invalid" for keyVaultReferenceIdentityType is invalid. Allowed values are "SystemAssigned" and "UserAssigned".'});
		});
		test('system assigned + kvid', () => {
			expect(validateYamlConfig(constants.systemAssignedNotValidForNonNullkvid)).toStrictEqual({valid : false, error : 'The "keyVaultReferenceIdentity" should omitted or set to null when using the "SystemAssigned" identity type.'});
		});
		test('user assigned + no kvid', () => {
			expect(validateYamlConfig(constants.userAssignedNotValidForNullkvid)).toStrictEqual({valid : false, error : `"The value for 'keyVaultReferenceIdentity' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'keyVaultReferenceIdentity'."`});
		});
		test('public ip is invalid', () => {
			expect(validateYamlConfig(constants.invalidPublicIPDisabled)).toStrictEqual({valid : false, error : `The value "mohit" for publicIPDisabled is invalid. The value should be either true or false.`});
		});
	});
	test('public ip cannot be true when there is no subnet', () => {
		expect(validateYamlConfig(constants.publicIPDisabledTrueWithoutSubnet)).toStrictEqual({valid : false, error : `Public IP deployment can only be disabled for tests against private endpoints. For public endpoints, set publicIPDisabled to False.`});
	});
	test('config files property is invalid', () => {
		expect(validateYamlConfig(constants.invalidConfigFiles)).toStrictEqual({valid : false, error : `The value "sampledata.csv" for configurationFiles is invalid. Provide a valid list of strings.`});
	});
	test('zip files property is invalid', () => {
		expect(validateYamlConfig(constants.invalidZipFiles)).toStrictEqual({valid : false, error : `The value "bigdata.zip" for zipArtifacts is invalid. Provide a valid list of strings.`});
	});
	test('splitCSV is invalid', () => {
		expect(validateYamlConfig(constants.invalidSplitCSV)).toStrictEqual({valid : false, error : `The value "invalid" for splitAllCSVs is invalid. The value should be either true or false`});
	});
	describe('user prop invalid', () => {
		test('user prop is invalid', () => {
			expect(validateYamlConfig(constants.invalidUserProp)).toStrictEqual({valid : false, error : `The value "mohit.prop" for userPropertyFile is invalid. Provide a valid file path of type ".properties". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`});
		});
		test('user prop is invalid', () => {
			expect(validateYamlConfig(constants.invalidUserProp2)).toStrictEqual({valid : false, error : `The value "123" for userPropertyFile is invalid. Provide a valid file path of type ".properties". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`});
		});
		test('user prop is invalid for Locust', () => {
			let expectedErr = `The value "invalid.properties" for userPropertyFile is invalid. Provide a valid file path of type ".conf", ".toml" or ".ini". Refer to the YAML syntax at https://learn.microsoft.com/azure/load-testing/reference-test-config-yaml#properties-configuration.`;
			expect(validateYamlConfig(constants.invalidUserProp3)).toStrictEqual({valid : false, error : expectedErr});
		});
	});
	describe('auto stop invalid cases', () => {
		test('auto stop disable is invalid', () => {
			expect(validateYamlConfig(constants.invalidAutoStop1)).toStrictEqual({valid : false, error : `Invalid value for "autoStop", for disabling auto stop use "autoStop: disable"`});
		});
		test('auto stop enable is invalid for error percentage', () => {
			expect(validateYamlConfig(constants.invalidAutoStop2)).toStrictEqual({valid : false, error : `The value "-1.1" for errorPercentage of auto-stop criteria is invalid. The value should be valid decimal number from 0 to 100.`});
		});
		test('auto stop enable is invalid for time range', () => {
			expect(validateYamlConfig(constants.invalidAutoStop3)).toStrictEqual({valid : false, error : `The value "-100.01" for timeWindow of auto-stop criteria is invalid. The value should be valid integer greater than 0.`});
		});
	});
	
	describe('Multi region config invalid scenarios', () => {
		test('Invalid regional engine instance', () => {
			expect(validateYamlConfig(constants.multiRegionConfigTestInvalidEngineInstances)).toStrictEqual({valid : false, error : `The value "-1" for engineInstances in regionalLoadTestConfig is invalid. The value should be an integer between 1 and 400.`});
		});
		test('Null region value', () => {
			expect(validateYamlConfig(constants.multiRegionConfigTestNullRegion)).toStrictEqual({valid : false, error : `The value "null" for region in regionalLoadTestConfig is invalid. Provide a valid string.`});
		});
		test('Empty region value', () => {
			expect(validateYamlConfig(constants.multiRegionConfigTestEmptyRegion)).toStrictEqual({valid : false, error : `The value "" for region in regionalLoadTestConfig is invalid. Provide a valid string.`});
		});
		test('Invalid engine instance sum', () => {
			expect(validateYamlConfig(constants.multiRegionConfigTestInvalidEngineInstanceSum)).toStrictEqual({valid : false, error : `The sum of engineInstances in regionalLoadTestConfig should be equal to the value of totalEngineInstances "1" in the test configuration.`});
		});
		test('Invalid number of regions', () => {
			expect(validateYamlConfig(constants.multiRegionConfigTestInvalidNumberOfRegions)).toStrictEqual({valid : false, error : `Multi-region load tests should contain a minimum of 2 geographic regions in the configuration.`});
		});
	});
	
})

describe('valid yaml tests', () => {
	test('check for basic yaml', () => {
		expect(validateYamlConfig(constants.jmxComprehensiveYaml)).toStrictEqual({valid : true, error : ""});
	});
	test('check for case sensitivity in yaml', () => {
		expect(validateYamlConfig(constants.caseSensitiveYaml)).toStrictEqual({valid : true, error : ""});
	});
	test('URL test', () => {
		expect(validateYamlConfig(constants.urlYaml)).toStrictEqual({valid : true, error : ""});
	});
	test('Locust test', () => {
		let expectedErr = {valid : true, error : ""};
		expect(validateYamlConfig(constants.locustYaml)).toStrictEqual(expectedErr);
	});
	test('subnet id and PIP is true', () => {
		expect(validateYamlConfig(constants.subnetIdPIPDisabledTrue)).toStrictEqual({valid : true, error : ""});
	});
});

describe('reference identity validations', () => {
	test('Basic test with UAMI for all the refIds', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesBasicYaml)).toStrictEqual({valid : true, error : ""});
	});
	
	test('Basic test with SAMI for all the refIds', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesSystemAssignedBasicYaml)).toStrictEqual({valid : true, error : ""});
	});
	
	test('Basic test with UAMI and SAMI for few of the refIds', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesSystemAssignedAndUserAssignedYaml)).toStrictEqual({valid : true, error : ""});
	});
	
	test('no refIds', () => {
		expect(validateYamlConfig(referenceIdentityConstants.noReferenceIdentities)).toStrictEqual({valid : true, error : ""});
	});
	
	test('keyVault is given outside of the refIds', () => {
		expect(validateYamlConfig(referenceIdentityConstants.keyVaultGivenOutOfRefIds)).toStrictEqual({valid : true, error : ''});
	});
	
	// invalid scenarios.
	test('2 system assigned ids on the KeyVault', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentities2SystemAssignedForKeyVault)).toStrictEqual({valid : false, error : 'Only one KeyVault reference identity should be provided in the referenceIdentities array.'});
	});
	
	test('2 system assigned on the Metrics', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentities2SystemAssignedForMetrics)).toStrictEqual({valid : false, error : 'Only one Metrics reference identity should be provided in the referenceIdentities array.'});
	});
	
	test('2 system assigned on the Engine', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentities2SystemAssignedForEngine)).toStrictEqual({valid : false, error : 'Only one Engine reference identity with SystemAssigned should be provided in the referenceIdentities array.'});
	});
	
	test('2 UAMI ids on the KeyVault', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentities2UAMIForKeyVault)).toStrictEqual({valid : false, error : 'Only one KeyVault reference identity should be provided in the referenceIdentities array.'});
	});
	
	test('2 UAMI on the Metrics', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentities2UAMIForMetrics)).toStrictEqual({valid : false, error : 'Only one Metrics reference identity should be provided in the referenceIdentities array.'});
	});
	
	test('UAMI and SAMI for KeyVault', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesSystemAssignedAndUAMIForKeyVault)).toStrictEqual({valid : false, error : 'KeyVault reference identity should be either SystemAssigned or UserAssigned but not both.'});
	});
	
	test('UAMI and SAMI for Metrics', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesSystemAssignedAndUAMIForMetrics)).toStrictEqual({valid : false, error : 'Metrics reference identity should be either SystemAssigned or UserAssigned but not both.'});
	});
	
	test('UAMI and SAMI for Engine', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesSystemAssignedAndUAMIForEngine)).toStrictEqual({valid : false, error : 'Engine reference identity should be either SystemAssigned or UserAssigned but not both.'});
	});
	
	test('KeyVault inside and outside', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesGivenInKeyVaultOutsideAndInside)).toStrictEqual({valid : false, error : 'Two KeyVault references are defined in the YAML config file. Use either the keyVaultReferenceIdentity field or the referenceIdentities section to specify the KeyVault reference identity.'});
	});
	
	test('reference identities is not an array', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesNotAnArray)).toStrictEqual({valid : false, error : `The value "${referenceIdentityConstants.referenceIdentitiesNotAnArray.referenceIdentities.toString()}" for referenceIdentities is invalid. Provide a valid list of reference identities.`});
	});
	
	test('reference identities has wrong kind', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesWithImproperKind)).toStrictEqual({valid : false, error : `The value "MetricsDummy" for kind in referenceIdentity is invalid. Allowed values are 'Metrics', 'Keyvault' and 'Engine'.`});
	});
	
	test('reference identities has wrong type', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitiesWithImproperType)).toStrictEqual({valid : false, error : 'The value "Dummy" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".'});
	});
	
	test('system assigned with value given', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentityWithValueButSystemAssigned)).toStrictEqual({valid : false, error : 'The "reference identity value" should omitted or set to null when using the "SystemAssigned" identity type.'});
	});
	
	test('system assigned with value given', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentityWithNoValueButUserAssigned)).toStrictEqual({valid : false, error : `The value for 'referenceIdentity value' cannot be null when using the 'UserAssigned' identity type. Provide a valid identity reference for 'reference identity value'.`});
	});
	
	test('invalid kvid', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitywithInvalidKVID)).toStrictEqual({valid : false, error : `The value "dummy" for reference identity is invalid. The value should be a string of the format: "/subscriptions/{subsId}/resourceGroups/{rgName}/providers/Microsoft.ManagedIdentity/userAssignedIdentities/{identityName}".`});
	});
	test('invalid values for kvid', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitywithInvalidKVIDAsStringItself)).toStrictEqual({valid : false, error : `The value "hi123,123" for id in referenceIdentities is invalid. Provide a valid string.`});
	});
	test('invalid values as string', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentitywithInvalidDict)).toStrictEqual({valid : false, error : `The value "mohit1" for referenceIdentities is invalid. Provide a valid dictionary with kind, value and type.`});
	});
	test('invalid type as string', () => {
		expect(validateYamlConfig(referenceIdentityConstants.referenceIdentityTypewithInvalidStringInKVID)).toStrictEqual({valid : false, error : `The value "UserAssigned,SystemAssigned" for type in referenceIdentities is invalid. Allowed values are "SystemAssigned" and "UserAssigned".`});
	});
});
describe('app components and server config tests', () => {
	test('app components with metrics', () => {
		expect(validateYamlConfig(appCompsConstants.appComponentsWithMetrics)).toStrictEqual({valid : true, error : ''});
	});
	test('without metrics and kind', () => {
		expect(validateYamlConfig(appCompsConstants.appComponentsWithoutMetricsAndKind)).toStrictEqual({valid : true, error : ''});
	});
	
	// invalid starts
	test('invalid resource id as string', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidResourceIdString)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourceGroups/sample-rg/providers/Microsoft.Web/serverfarms/sample-web" for resourceId in appComponents is invalid. Provide a valid resourceId.'});
	});
	// above one returns as it is string and this retuns the lowercase.
	test('invalid resource id', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidResourceId)).toStrictEqual({valid : false, error : 'The value "/subscriptions/abcdef01-2345-6789-0abc-def012345678/resourcegroups/sample-rg/providers/microsoft.web/serverfarms" for resourceId in appComponents is invalid. Provide a valid resourceId.'});
	});
	test('invalid kind', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidKind)).toStrictEqual({valid : false, error : 'The value "test,test2" for kind in appComponents is invalid. Provide a valid string.'});
	});
	test('invalid resource name', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidResourceName)).toStrictEqual({valid : false, error : 'The value "test,test2" for resourceName in appComponents is invalid. Provide a valid string.'});
	});
	test('invalid metrics array', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidMetricsArray)).toStrictEqual({valid : false, error : 'The value "dummy" for metrics in the appComponent with resourceName "test" is invalid. Provide a valid list of metrics.'});
	});
	test('invalid metrics dictionary', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidMetricDict)).toStrictEqual({valid : false, error : 'The value "hi,123" for metrics in the appComponent with resourceName "test" is invalid. Provide a valid dictionary.'});
	});
	test('invalid metric name', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidMetricName)).toStrictEqual({valid : false, error : 'The value "123" for name in the appComponent with resourceName "test" is invalid. Provide a valid string.'});
	});
	test('invalid metric aggregation', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidMetricAggregation)).toStrictEqual({valid : false, error : 'The value "Average,Min" for aggregation in the appComponent with resourceName "test" is invalid. Provide a valid string.'});
	});
	test('invalid metric namepspace', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidMetricNameSpace)).toStrictEqual({valid : false, error : 'The value "dummy,dummy2" for namespace in the appComponent with resourceName "test" is invalid. Provide a valid string.'});
	});
	test('invalid app component dictionary', () => {
		expect(validateYamlConfig(appCompsConstants.appCompsInvalidAppComponentDictionary)).toStrictEqual({valid : false, error : 'The value "hi,123" for AppComponents in the index "1" is invalid. Provide a valid dictionary.'});
	});
});

describe('pass fail criteria tests', () => {
	test('Basic Valid failure criteria tests with new model.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ClientAndServerPFDefaultMetrics)).toStrictEqual({valid : true, error : ''});
	});
	test('Basic Valid failure criteria tests with old model.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ClientPFDefaultMetrics)).toStrictEqual({valid : true, error : ''});
	});
	test('Basic Valid failure criteria tests with new model.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsNoNameSpace)).toStrictEqual({valid : true, error : ''});
	});
	// invalid starts
	test('invalid pf criteria dictionary for client side', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ClientPFInvalidFailureEnum)).toStrictEqual({valid : false, error : 'The value "dummy" for failureCriteria is invalid. Provide a valid dictionary with keys as clientMetrics and serverMetrics.'});
	});
	test('invalid pf criteria as an array for client side', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ClientPFInvalidFailureNonArray)).toStrictEqual({valid : false, error : 'The value "GetCustomerName,avg(response_time_ms) > 3000" for clientMetrics in failureCriteria is invalid. Provide a valid criteria.'});
	});
	test('invalid pf criteria as non array for server side', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ClientPFInvalidFailureCriteriaServerNonArray)).toStrictEqual({valid : false, error : 'The value "1:2" for serverMetrics in failureCriteria is invalid. Provide a valid list of criteria.'});
	});
	test('invalid pf criteria as an array for client side in old model.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ClientPFInvalidString)).toStrictEqual({valid : false, error : 'The value "GetCustomerName,avg(response_time_ms) > 3000" for failureCriteria is invalid. Provide a valid criteria.'});
	});
	test('invalid pf criteria condition for serever side.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongCondition)).toStrictEqual({valid : false, error : 'The value "Dummy" for condition in serverMetrics in failureCriteria is invalid. Provide a valid condition from "GreaterThan", "LessThan".'});
	});
	test('invalid pf wrong dictionary for serever side.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongDictionary)).toStrictEqual({valid : false, error : 'The value "test-123" for serverMetrics in failureCriteria is invalid. Provide a valid dictionary with metricName, aggregation, condition, value and optionally metricNamespace.'});
	});
	test('invalid pf for server side with no resourceId.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsNoResourceId)).toStrictEqual({valid : false, error : 'The value "undefined" for resourceId in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with no metric name.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsNoMetricName)).toStrictEqual({valid : false, error : 'The value "undefined" for metricName in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with no aggregation.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsNoaggregation)).toStrictEqual({valid : false, error : 'The value "undefined" for aggregation in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with no value.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsNoValue)).toStrictEqual({valid : false, error : 'The value "undefined" for value in serverMetrics in failureCriteria is invalid. Provide a valid number.'});
	});
	
	test('invalid pf for server side with wrong resourceId.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongResourceId)).toStrictEqual({valid : false, error : 'The value "test1,test2" for resourceId in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with wrong metricNameSpace.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongNameSpace)).toStrictEqual({valid : false, error : 'The value "test1,test2" for metricNameSpace in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with wrong metric name.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongMetricName)).toStrictEqual({valid : false, error : 'The value "test1,test2" for metricName in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with wrong aggregation.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongaggregation)).toStrictEqual({valid : false, error : 'The value "test1,test2" for aggregation in serverMetrics in failureCriteria is invalid. Provide a valid string.'});
	});
	test('invalid pf for server side with wrong value.', () => {
		expect(validateYamlConfig(passFailCriteriaConstants.ServerPFMetricsWrongValue)).toStrictEqual({valid : false, error : 'The value "80" for value in serverMetrics in failureCriteria is invalid. Provide a valid number.'});
	});
})