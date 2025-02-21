"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocustFrameworkModel = void 0;
const TestKind_1 = require("./TestKind");
/**
 * Locust load test framework.
 */
class LocustFrameworkModel {
    constructor() {
        // Constants
        /**
         * The kind of the load test framework.
         */
        this.kind = TestKind_1.TestKind.Locust;
        /**
         * The display name of the load test framework.
         */
        this.frameworkDisplayName = "Locust (preview)";
        /**
         * The file extension for the test script file.
         */
        this.testScriptFileExtension = "py";
        /**
         * The file extensions for the configuration files.
         */
        this.userPropertyFileExtensions = ["conf", "ini", "toml"];
        /**
         * Strings for the client resources.
         */
        this.ClientResources = {
            /**
             * Friendly string of the user property extensions.
             */
            userPropertyFileExtensionsFriendly: "\".conf\", \".toml\" or \".ini\"",
        };
        // Data related to the framework
        // Methods
    }
}
exports.LocustFrameworkModel = LocustFrameworkModel;
