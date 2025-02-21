import { PostTaskParameters } from "./models/UtilModels";
import { AuthenticationUtils } from "./models/AuthenticationUtils";
import { APIService } from "./models/APIService";
import { isNullOrUndefined } from "util";
import * as CoreUtils from './models/CoreUtils';

async function run() {
    try {

        const runId = process.env[PostTaskParameters.runId];
        const baseUri = process.env[PostTaskParameters.baseUri];
        const isRunCompleted = process.env[PostTaskParameters.isRunCompleted];
        if(!isNullOrUndefined(runId) && !isNullOrUndefined(baseUri) && (isNullOrUndefined(isRunCompleted) || isRunCompleted != 'true')) {
            const authContext = new AuthenticationUtils();
            const apiService = new APIService(authContext);
            await apiService.stopTestRun(baseUri, runId);
        }
    }
    catch(err : any) {
        CoreUtils.debug("Failed to stop the test run:" + err.message);
    }
}

run();