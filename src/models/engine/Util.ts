import { BaseLoadTestFrameworkModel } from "./BaseLoadTestFrameworkModel";
import { JMeterFrameworkModel } from "./JMeterFrameworkModel";
import { LocustFrameworkModel } from "./LocustFrameworkModel";
import { TestKind } from "./TestKind";

var _jmeterFramework = new JMeterFrameworkModel();
var _locustFramework = new LocustFrameworkModel();

/**
 * Enumeration representing the available load test frameworks.
 */
export enum LoadTestFramework {
    JMeter = "JMeter",
    Locust = "Locust",
}

/**
 * Retrieves an array of load test frameworks in a specific order.
 * @returns An array of load test frameworks.
 */
export function getOrderedLoadTestFrameworks(): LoadTestFramework[] {
    return [LoadTestFramework.JMeter, LoadTestFramework.Locust];
}

/**
 * Returns the corresponding LoadTestFrameworkModel based on the provided LoadTestFramework enum.
 * If the provided framework is not recognized, it assumes JMeter by default.
 * @param framework The LoadTestFramework to get the corresponding LoadTestFrameworkModel for.
 * @returns The corresponding LoadTestFrameworkModel.
 */
export function getLoadTestFrameworkModel(framework: LoadTestFramework): BaseLoadTestFrameworkModel {
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
export function getLoadTestFrameworkDisplayName(framework: LoadTestFramework): string {
    return getLoadTestFrameworkModel(framework).frameworkDisplayName;
}

/**
 * Checks if a given test kind is convertible to JMX.
 * If the kind is not provided, it assumes JMX by default.
 * @param kind The test kind to check.
 * @returns True if the test kind is convertible to JMX, false otherwise.
 */
export function isTestKindConvertibleToJMX(kind?: TestKind): boolean {
    if (!kind) {
        // Assume JMX by default
        return false;
    }
    return kind === TestKind.URL;
}

/**
 * Retrieves the load test framework from a given test kind.
 * If no kind is provided, it assumes JMX by default.
 * @param kind The test kind.
 * @returns The load test framework for the test kind.
 */
export function getLoadTestFrameworkFromKind(kind?: TestKind): LoadTestFramework {
    if (!kind) {
        // Assume JMX by default
        return LoadTestFramework.JMeter;
    }
    switch (kind) {
        case TestKind.JMX:
            return LoadTestFramework.JMeter;
        case TestKind.Locust:
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
export function getLoadTestFrameworkModelFromKind(kind?: TestKind): BaseLoadTestFrameworkModel {
    return getLoadTestFrameworkModel(getLoadTestFrameworkFromKind(kind));
}

export module Resources {
    export module Strings {
        export const allFrameworksFriendly = "URL, JMX and Locust";
    }
}
