/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    reporters: ["default", "jest-junit"],
    // testPathIgnorePatterns: ["src/models/.*\\.ts", ".*\\.ts"], // references can be used later, so leaving in comments
    // testRegex: "test/.*\\.test\\.ts$",
    coverageReporters: ["json", "lcov", "text", "clover", "cobertura"],
    coverageDirectory: "<rootDir>/coverage/unit",
    collectCoverageFrom: ["<rootDir>/src/**/*.ts"],
};