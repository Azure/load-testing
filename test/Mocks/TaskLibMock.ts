import * as sinon from "sinon";
import * as tl from 'azure-pipelines-task-lib/task';
import { IExecSyncResult } from "azure-pipelines-task-lib/toolrunner";

export class TaskLibMock {
    private mockValues: { [key: string]: string | undefined } = {};
    private endpointAuthorizationParameterStub: sinon.SinonStub = sinon.stub();
    private debugStub: sinon.SinonStub = sinon.stub();
    private execSyncStub: sinon.SinonStub = sinon.stub();

    constructor() {
        this.setupMock();
    }

    public setEndpointUrl(endpointId: string, value?: string) {
        let key = `ENDPOINT_${endpointId}`;
        this.mockValues[key] = value;
    }

    public setEndpointDataParameter(endpointId: string, parameterName: string, value?: string) {
        let key = `ENDPOINT_DATA_${endpointId}_${parameterName}`;
        this.mockValues[key] = value;
    }

    public setEndpointAuthorizationParameter(endpointId: string, parameterName: string, value?: string) {
        let key = `ENDPOINT_AUTH_${endpointId}_${parameterName}`;
        this.mockValues[key] = value;
    }

    public setEndpointAuthorizationScheme(endpointId: string, value?: string) {
        let key = `ENDPOINT_AUTH_SCHEME_${endpointId}`;
        this.mockValues[key] = value;
    }

    public setInput(input: string, value?: string) {
        let key = `INPUT_${input}`;
        this.mockValues[key] = value;
    }

    public setTaskVariable(variableName: string, value?: string) {
        let key = `TASKVAR_${variableName}`;
        this.mockValues[key] = value;
    }

    public setVariable(variableName: string, value?: string) {
        let key = `VAR_${variableName}`;
        this.mockValues[key] = value;
    }

    public setExecSync(command: string, args: string | string[], result: IExecSyncResult) {
        this.execSyncStub.withArgs(command, args).returns(result);
    }

    public getEndpointAuthorizationParameterCalledWith(endpointId: string, parameterName: string, optional: boolean): boolean {
        return this.endpointAuthorizationParameterStub.calledWith(endpointId, parameterName, optional);
    }

    public debugCalledWith(message: string): boolean {
        return this.debugStub.calledWith(message);
    }

    public execSyncCalledWith(command: string, args: string | string[]): boolean {
        return this.execSyncStub.calledWith(command, args);
    }

    public getTaskVariable(variableName: string): string | undefined {
        let key = `TASKVAR_${variableName}`;
        return this.mockValues[key];
    }

    public getResult(): string | undefined {
        return this.mockValues['TASKVAR_RESULT'];
    }

    private getEndpointUrl(endpointId: string, optional: boolean): string | undefined {
        let key = `ENDPOINT_${endpointId}`;
        return this.mockValues[key];
    }

    private getEndpointDataParameter(endpointId: string, parameterName: string, optional: boolean): string | undefined {
        let key = `ENDPOINT_DATA_${endpointId}_${parameterName}`;
        return this.mockValues[key];
    }

    private getEndpointAuthorizationParameter(endpointId: string, parameterName: string, optional: boolean): string | undefined {
        let key = `ENDPOINT_AUTH_${endpointId}_${parameterName}`;
        return this.mockValues[key];
    }

    private getEndpointAuthorizationScheme(endpointId: string): string | undefined {
        let key = `ENDPOINT_AUTH_SCHEME_${endpointId}`;
        return this.mockValues[key];
    }

    private getInput(input: string): string | undefined {
        let key = `INPUT_${input}`;
        return this.mockValues[key];
    }

    private getVariable(variableName: string): string | undefined {
        let key = `VAR_${variableName}`;
        return this.mockValues[key];
    }

    private setResult(result: tl.TaskResult, message: string): void {
        this.mockValues['TASKVAR_RESULT'] = result.toString();
    }

    private setSecret(secret: string): void {}

    private debug(message: string): void {}

    private setupMock() {
        this.endpointAuthorizationParameterStub = sinon.stub(tl, "getEndpointAuthorizationParameter").callsFake(this.getEndpointAuthorizationParameter.bind(this));
        this.debugStub = sinon.stub(tl, "debug").callsFake(this.debug.bind(this));
        this.execSyncStub = sinon.stub(tl, "execSync");

        sinon.stub(tl, "getEndpointUrl").callsFake(this.getEndpointUrl.bind(this));
        sinon.stub(tl, "getEndpointDataParameter").callsFake(this.getEndpointDataParameter.bind(this));
        sinon.stub(tl, "getEndpointAuthorizationScheme").callsFake(this.getEndpointAuthorizationScheme.bind(this));
        sinon.stub(tl, "getInput").callsFake(this.getInput.bind(this));
        sinon.stub(tl, "getTaskVariable").callsFake(this.getTaskVariable.bind(this));
        sinon.stub(tl, "getVariable").callsFake(this.getVariable.bind(this));
        sinon.stub(tl, "setTaskVariable").callsFake(this.setTaskVariable.bind(this));
        sinon.stub(tl, "setResult").callsFake(this.setResult.bind(this));
        sinon.stub(tl, "setSecret").callsFake(this.setSecret.bind(this));
        sinon.stub(tl, "setVariable").callsFake(this.setVariable.bind(this));
    }
}