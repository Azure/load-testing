import { PostTaskParameters } from "./models/UtilModels";
import * as core from '@actions/core';
import { AuthenticationUtils } from "./models/AuthenticationUtils";
import { YamlConfig } from "./models/TaskModels";
import { APISupport } from "./models/APISupport";
import { isNull, isNullOrUndefined } from "util";

async function run() {
    try {

        const runId = core.getTaskVariable(PostTaskParameters.runId);
        const baseUri = core.getTaskVariable(PostTaskParameters.baseUri);
        const isRunCompleted = core.getTaskVariable(PostTaskParameters.isRunCompleted);
        if(!isNullOrUndefined(runId) && !isNullOrUndefined(baseUri) && (isNullOrUndefined(isRunCompleted) || isRunCompleted != 'true')) {
            const yamlConfig = new YamlConfig(true);
            const authContext = new AuthenticationUtils();
            const apiSupport = new APISupport(authContext, yamlConfig);
            await apiSupport.stopTestRunPostProcess(baseUri, runId);
        }
    }
    catch(err : any) {
        core.debug("Failed to stop the test run:" + err.message);
    }
}

run();