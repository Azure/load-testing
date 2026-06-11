import { getPassFailCriteriaFromString } from "../src/Utils/PassFailCriteriaUtil";

describe("PassFailCriteriaUtil tests", () => {
    it("retains decimal value for requests_per_sec", () => {
        expect(getPassFailCriteriaFromString(["avg(requests_per_sec) > 1.75"])).toStrictEqual({
            "requests_per_sec avg > continue": 1.75
        });
    });

    it("keeps minimum threshold when duplicate requests_per_sec criteria are provided", () => {
        expect(getPassFailCriteriaFromString(["avg(requests_per_sec) > 1.9", "avg(requests_per_sec) > 1.2"])).toStrictEqual({
            "requests_per_sec avg > continue": 1.2
        });
    });
});
