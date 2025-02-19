"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resources = exports.LoadTestFramework = void 0;
exports.getOrderedLoadTestFrameworks = getOrderedLoadTestFrameworks;
exports.getLoadTestFrameworkModel = getLoadTestFrameworkModel;
exports.getLoadTestFrameworkDisplayName = getLoadTestFrameworkDisplayName;
exports.isTestKindConvertibleToJMX = isTestKindConvertibleToJMX;
exports.getLoadTestFrameworkFromKind = getLoadTestFrameworkFromKind;
exports.getLoadTestFrameworkModelFromKind = getLoadTestFrameworkModelFromKind;
const JMeterFrameworkModel_1 = require("./JMeterFrameworkModel");
const LocustFrameworkModel_1 = require("./LocustFrameworkModel");
const TestKind_1 = require("./TestKind");
var _jmeterFramework = new JMeterFrameworkModel_1.JMeterFrameworkModel();
var _locustFramework = new LocustFrameworkModel_1.LocustFrameworkModel();
/**
 * Enumeration representing the available load test frameworks.
 */
var LoadTestFramework;
(function (LoadTestFramework) {
    LoadTestFramework["JMeter"] = "JMeter";
    LoadTestFramework["Locust"] = "Locust";
})(LoadTestFramework || (exports.LoadTestFramework = LoadTestFramework = {}));
/**
 * Retrieves an array of load test frameworks in a specific order.
 * @returns An array of load test frameworks.
 */
function getOrderedLoadTestFrameworks() {
    return [LoadTestFramework.JMeter, LoadTestFramework.Locust];
}
/**
 * Returns the corresponding LoadTestFrameworkModel based on the provided LoadTestFramework enum.
 * If the provided framework is not recognized, it assumes JMeter by default.
 * @param framework The LoadTestFramework to get the corresponding LoadTestFrameworkModel for.
 * @returns The corresponding LoadTestFrameworkModel.
 */
function getLoadTestFrameworkModel(framework) {
    switch (framework) {
        case LoadTestFramework.JMeter:
            return _jmeterFramework;
        case LoadTestFramework.Locust:
            return _locustFramework;
        default:
            // Assume JMeter by default
            return _jmeterFramework;
    }
}
/**
 * Retrieves the display name of a load test framework.
 * @param framework The load test framework.
 * @returns The display name of the load test framework.
 */
function getLoadTestFrameworkDisplayName(framework) {
    return getLoadTestFrameworkModel(framework).frameworkDisplayName;
}
/**
 * Checks if a given test kind is convertible to JMX.
 * If the kind is not provided, it assumes JMX by default.
 * @param kind The test kind to check.
 * @returns True if the test kind is convertible to JMX, false otherwise.
 */
function isTestKindConvertibleToJMX(kind) {
    if (!kind) {
        // Assume JMX by default
        return false;
    }
    return kind === TestKind_1.TestKind.URL;
}
/**
 * Retrieves the load test framework from a given test kind.
 * If no kind is provided, it assumes JMX by default.
 * @param kind The test kind.
 * @returns The load test framework for the test kind.
 */
function getLoadTestFrameworkFromKind(kind) {
    if (!kind) {
        // Assume JMX by default
        return LoadTestFramework.JMeter;
    }
    switch (kind) {
        case TestKind_1.TestKind.JMX:
            return LoadTestFramework.JMeter;
        case TestKind_1.TestKind.Locust:
            return LoadTestFramework.Locust;
        default:
            return LoadTestFramework.JMeter;
    }
}
/**
 * Retrieves the load test framework model from a given test kind.
 * If no kind is provided, it assumes JMX by default.
 * @param kind The test kind.
 * @returns The load test framework model for the test kind.
 */
function getLoadTestFrameworkModelFromKind(kind) {
    return getLoadTestFrameworkModel(getLoadTestFrameworkFromKind(kind));
}
var Resources;
(function (Resources) {
    let Strings;
    (function (Strings) {
        Strings.allFrameworksFriendly = "URL, JMX and Locust";
    })(Strings = Resources.Strings || (Resources.Strings = {}));
})(Resources || (exports.Resources = Resources = {}));
