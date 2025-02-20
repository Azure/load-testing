"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JMeterFrameworkModel = void 0;
const TestKind_1 = require("./TestKind");
/**
 * JMeter load test framework.
 */
class JMeterFrameworkModel {
    constructor() {
        // Constants
        /**
         * The kind of the load test framework.
         */
        this.kind = TestKind_1.TestKind.JMX;
        /**
         * The display name of the load test framework.
         */
        this.frameworkDisplayName = "JMeter";
        /**
         * The file extension for the test script file.
         */
        this.testScriptFileExtension = "jmx";
        /**
         * The file extensions for the configuration files.
         */
        this.userPropertyFileExtensions = ["properties"];
        /**
         * Strings for the client resources.
         */
        this.ClientResources = {
            /**
             * Friendly string of the user property extensions.
             */
            userPropertyFileExtensionsFriendly: "\".properties\"",
        };
        // Data related to the framework
        // Methods
    }
}
exports.JMeterFrameworkModel = JMeterFrameworkModel;
