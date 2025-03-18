import { TestKind } from "../TestKind";
import { BaseLoadTestFrameworkModel } from "./BaseLoadTestFrameworkModel";

/**
 * Locust load test framework.
 */
export class LocustFrameworkModel implements BaseLoadTestFrameworkModel {
    // Constants
    /**
     * The kind of the load test framework.
     */
    readonly kind: TestKind = TestKind.Locust;
    
    /**
     * The display name of the load test framework.
     */
    readonly frameworkDisplayName: string = "Locust (preview)";

    /**
     * The file extension for the test script file.
     */
    readonly testScriptFileExtension: string = "py";

    /**
     * The file extensions for the configuration files.
     */
    readonly userPropertyFileExtensions: string[] = ["conf", "ini", "toml"];

    /**
     * Strings for the client resources.
     */
    readonly ClientResources = {
        /**
         * Friendly string of the user property extensions.
         */
        userPropertyFileExtensionsFriendly: "\".conf\", \".toml\" or \".ini\"",
    };

    // Data related to the framework

    // Methods
}
