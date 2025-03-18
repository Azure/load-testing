import * as sinon from "sinon";
import * as core from '@actions/core';

export class CoreMock {
    private mockValues: { [key: string]: string | undefined } = {};
    private debugStub: sinon.SinonStub = sinon.stub();

    constructor() {
        this.setupMock();
    }

    public setInput(input: string, value?: string) {
        let key = `INPUT_${input}`;
        this.mockValues[key] = value;
    }

    public exportVariable(variableName: string, value?: string) {
        let key = `VAR_${variableName}`;
        this.mockValues[key] = value;
    }

    public getVariable(variableName: string): string | undefined {
        let key = `VAR_${variableName}`;
        return this.mockValues[key];
    }

    public debugCalledWith(message: string): boolean {
        return this.debugStub.calledWith(message);
    }

    public getResult(): string | undefined {
        return this.mockValues['RESULT'];
    }

    private getInput(input: string): string {
        let key = `INPUT_${input}`;
        return this.mockValues[key] ?? "";
    }

    private setFailed(message: string | Error): void {
        this.mockValues['RESULT'] = 'FAILED';
    }

    private debug(message: string): void {}

    private setOutput(name: string, value: string): void {
        let key = `OUTPUT_${name}`;
        this.mockValues[key] = value;
    }

    private setupMock() {
        this.debugStub = sinon.stub(core, "debug").callsFake(this.debug.bind(this));

        sinon.stub(core, "getInput").callsFake(this.getInput.bind(this));
        sinon.stub(core, "exportVariable").callsFake(this.exportVariable.bind(this));
        sinon.stub(core, "setFailed").callsFake(this.setFailed.bind(this));
        sinon.stub(core, "setOutput").callsFake(this.setOutput.bind(this));
    }
}