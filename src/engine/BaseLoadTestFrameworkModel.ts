import { TestKind } from "./TestKind";

/**
 * Represents a load test framework.
 */
export interface BaseLoadTestFrameworkModel {
    //Constants
    /**
     * The kind of the load test framework.
     */
    readonly kind: TestKind;

    /**
     * The display name of the load test framework.
     */
    readonly frameworkDisplayName: string;

    /**
     * The file extension for the test script file.
     */
    readonly testScriptFileExtension: string;

    /**
     * The file extensions for the configuration files.
     */
    readonly userPropertyFileExtensions: string[];

    /**
     * Strings for the client resources.
     */
    readonly ClientResources: {
        /**
         * Friendly string of the user property extensions.
         */
        userPropertyFileExtensionsFriendly: string;
    };

    // Data related to the framework

    // Methods
}
