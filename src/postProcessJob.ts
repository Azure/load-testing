import { PostTaskParameters } from "./models/UtilModels";
import * as core from '@actions/core';
import { AuthenticationUtils } from "./models/AuthenticationUtils";
import { YamlConfig } from "./models/TaskModels";
import { APISupport } from "./models/APISupport";
import { isNullOrUndefined } from "util";

async function run() {
    try {

        const runId = process.env[PostTaskParameters.runId];
        const baseUri = process.env[PostTaskParameters.baseUri];
        const isRunCompleted = process.env[PostTaskParameters.isRunCompleted];
        console.log(runId, baseUri, isRunCompleted);
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