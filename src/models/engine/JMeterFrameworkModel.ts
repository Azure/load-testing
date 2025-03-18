import { TestKind } from "../TestKind";
import { BaseLoadTestFrameworkModel } from "./BaseLoadTestFrameworkModel";

/**
 * JMeter load test framework.
 */
export class JMeterFrameworkModel implements BaseLoadTestFrameworkModel {
    // Constants
    /**
     * The kind of the load test framework.
     */
    readonly kind: TestKind = TestKind.JMX;
    
    /**
     * The display name of the load test framework.
     */
    readonly frameworkDisplayName: string = "JMeter";

    /**
     * The file extension for the test script file.
     */
    readonly testScriptFileExtension: string = "jmx";

    /**
     * The file extensions for the configuration files.
     */
    readonly userPropertyFileExtensions: string[] = ["properties"];

    /**
     * Strings for the client resources.
     */
    readonly ClientResources = {
        /**
         * Friendly string of the user property extensions.
         */
        userPropertyFileExtensionsFriendly: "\".properties\"",
    };

    // Data related to the framework

    // Methods
}
