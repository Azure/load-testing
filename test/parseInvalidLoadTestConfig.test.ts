import * as sinon from "sinon";
import { TestSupport } from "./Utils/TestSupport";
import { CoreMock } from "./Mocks/CoreMock";
import * as InputConstants from "../src/Constants/InputConstants";
import { LoadtestConfigUtil } from "../src/Utils/LoadtestConfigUtil";

describe('parse invalid load test config tests', () => {

    let coreMock: CoreMock;

    beforeEach(function () {
        coreMock = new CoreMock();
    });
  
    afterEach(function () {
        sinon.restore();
    });

    it("missing config file", async () => {
        coreMock.setInput(InputConstants.loadTestConfigFile, "");

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow(`The input field "${InputConstants.loadTestConfigFileLabel}" is empty. Provide the path to load test yaml file.`);
    });

    it("invalid config file extension", async () => {
        coreMock.setInput(InputConstants.loadTestConfigFile, "invalidConfigFile.json");

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("The Load Test configuration file should be of type .yaml or .yml");
    });

    it("incorrect config files in url test", async () => {
        let yamlJson : any = {
            version: 'v0.1',
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.json',
            description: 'Load test website home page',
            testType: 'URL',
            configurationFiles: [ 'sampledata.csv', 'samplezip.zip' ]
        };
        TestSupport.createAndSetLoadTestConfigFile(yamlJson, coreMock);

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("Only CSV files are allowed as configuration files for a URL-based test.");
    });

    it("zip artifacts in url test", async () => {
        let yamlJson : any = {
            version: 'v0.1',
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.json',
            description: 'Load test website home page',
            testType: 'URL',
            configurationFiles: [ 'sampledata.csv' ],
            zipArtifacts: [ 'bigdata.zip' ]
        };
        TestSupport.createAndSetLoadTestConfigFile(yamlJson, coreMock);

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("Zip artifacts are not supported for the URL-based test.");
    });

    it("user prop file in url test", async () => {
        let yamlJson : any = {
            version: 'v0.1',
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.json',
            description: 'Load test website home page',
            testType: 'URL',
            configurationFiles: [ 'sampledata.csv' ],
            properties: { userPropertyFile: 'user.properties' },
        };
        TestSupport.createAndSetLoadTestConfigFile(yamlJson, coreMock);

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("User property file is not supported for the URL-based test.");
    });

    it("invalid secret name", async () => {
        let yamlJson : any = {
            version: 'v0.1',
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.json',
            description: 'Load test website home page',
            testType: 'URL',
            configurationFiles: [ 'sampledata.csv' ],
            secrets: [
                {
                  value: 'https://akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
                }
            ],
        };
        TestSupport.createAndSetLoadTestConfigFile(yamlJson, coreMock);

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("Invalid secret name");
    });

    it("invalid secret url", async () => {
        let yamlJson : any = {
            version: 'v0.1',
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.json',
            description: 'Load test website home page',
            testType: 'URL',
            configurationFiles: [ 'sampledata.csv' ],
            secrets: [
                {
                  name: 'my-secret',
                  value: 'akv-contoso.vault.azure.net/secrets/MySecret/abc1234567890def12345'
                }
            ],
        };
        TestSupport.createAndSetLoadTestConfigFile(yamlJson, coreMock);

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("Invalid secret url");
    });

    it("multiple certificates", async () => {
        let yamlJson : any = {
            version: 'v0.1',
            testId: 'SampleTest',
            displayName: 'Sample Test',
            testPlan: 'SampleTest.json',
            description: 'Load test website home page',
            testType: 'URL',
            configurationFiles: [ 'sampledata.csv' ],
            certificates: [
                {
                  name: 'my-certificate',
                  value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
                },
                {
                    name: 'my-certificate2',
                    value: 'https://akv-contoso.vault.azure.net/certificates/MyCertificate/abc1234567890def12345'
                  }
            ],
        };
        TestSupport.createAndSetLoadTestConfigFile(yamlJson, coreMock);

        expect(() => LoadtestConfigUtil.parseLoadtestConfigFile()).toThrow("Only one certificate can be added in the load test configuration");
    });
})