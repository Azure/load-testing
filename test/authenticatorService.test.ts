import * as sinon from "sinon";
import { AuthenticatorService } from "../src/services/AuthenticatorService";
import * as Constants from "./Constants/Constants";
import { FetchCallType } from "../src/models/UtilModels";
import * as AzCliUtility from "../src/Utils/AzCliUtility";

describe('authenticator service tests', () => {


    beforeEach(function () {
    });
  
    afterEach(function () {
        sinon.restore();
    });

    it("getDataPlaneHeader calls az cli", async () => {
        let tokenResult = {
            accessToken: "token"
        };
        let stub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.dataPlaneTokenScope]).resolves(tokenResult);

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let result = await authenticatorService.getDataPlaneHeader(FetchCallType.get);
        
        expect(stub.calledWith(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.dataPlaneTokenScope])).toBe(true);
        expect(result).toHaveProperty("Authorization");
    });

    it("getARMTokenHeader calls az cli", async () => {
        let tokenResult = {
            accessToken: "token"
        };
        let stub = sinon.stub(AzCliUtility, "execAz").withArgs(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.armTokenScope]).resolves(tokenResult);

        let authenticatorService = new AuthenticatorService(Constants.defaultTaskParameters);
        let result = await authenticatorService.getARMTokenHeader();
        
        expect(stub.calledWith(["account", "get-access-token", "--resource", Constants.defaultTaskParameters.armTokenScope])).toBe(true);
        expect(result).toHaveProperty("Authorization");
    });

})