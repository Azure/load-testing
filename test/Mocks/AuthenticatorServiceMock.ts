import * as sinon from "sinon";
import { AuthenticatorService } from "../../src/services/AuthenticatorService";
import { IHeaders } from "typed-rest-client/Interfaces";
import * as Constants from "../Constants/Constants";

export class AuthenticatorServiceMock {
    private getDataPlaneHeaderStub: sinon.SinonStub = sinon.stub();
    private getARMTokenHeaderStub: sinon.SinonStub = sinon.stub();

    public setupMock() {
        sinon.stub(AuthenticatorService.prototype, "authorize").callsFake(this.authorize);
        this.getDataPlaneHeaderStub = sinon.stub(AuthenticatorService.prototype, "getDataPlaneHeader").callsFake(this.getDataPlaneHeader);
        this.getARMTokenHeaderStub = sinon.stub(AuthenticatorService.prototype, "getARMTokenHeader").callsFake(this.getARMTokenHeader);
    }

    public getDataPlaneHeaderCalled(): boolean {
        return this.getDataPlaneHeaderStub.called;
    }

    public getARMTokenHeaderCalled(): boolean {
        return this.getARMTokenHeaderStub.called;
    }

    private async authorize() {
        return new Promise<void>((resolve, reject) => {
            resolve();
        });
    }

    private async getDataPlaneHeader() {
        let header = {
            "Authorization": Constants.authorizationHeaderValueDataPlane
        }
        return new Promise<IHeaders>((resolve, reject) => {
            resolve(header);
        });
    }

    private async getARMTokenHeader() {
        let header = {
            "Authorization": Constants.authorizationHeaderValueControlPlane
        }
        return new Promise<IHeaders>((resolve, reject) => {
            resolve(header);
        });
    }
}