import { sanitisePipelineNameHeader } from "../src/Utils/CommonUtils";
describe("CommonUtils tests", () => {
    it.each([
        {
            input: "Pipeline@2025#Release$!",
            expected: "Pipeline@2025#Release$!"
        },
        {
            input: "Build_Definition-01 (Test)  ",
            expected: "Build_Definition-01 (Test)"
        },
        {
            input: "Normal Name",
            expected: "Normal Name"
        },
        {
            input: "Special*&^%$#@!Characters",
            expected: "Special*&^%$#@!Characters"
        },
        {
            input: "",
            expected: ""
        },
        {
            input: "     ",
            expected: "-"
        },
        {
            input: "Name_with_underscores_and-dashes",
            expected: "Name_with_underscores_and-dashes"
        },
        {
            input: null,
            expected: null
        },
        {
            input: "🚀 Deploy",
            expected: "Deploy"
        },
        {
            input: "流水线-test-𰻞",
            expected: "-test-"
        }
    ])("sanitisePipelineNameHeader removes special characters", ({ input, expected }) => {
        const result = sanitisePipelineNameHeader(input);
        expect(result).toBe(expected);
    });
});