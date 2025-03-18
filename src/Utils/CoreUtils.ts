import * as core from '@actions/core';

export function exportVariable(name: string, value: string) {
    core.exportVariable(name, value);
}

export function debug(message: string) {
    core.debug(message);
}

export function getInput(name: string): string | undefined {
    let variable : string | undefined = core.getInput(name, {trimWhitespace: true});
    if(variable == '') {
        variable = undefined;
    }
    return variable
}

export function setFailed(message: string) {
    core.setFailed(message);
}

export function setOutput(name: string, value: string) {
    core.setOutput(name, value);
}