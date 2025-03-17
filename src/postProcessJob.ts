import { PostTaskParameters } from "./models/UtilModels";
import * as CoreUtils from './Utils/CoreUtils';
import { AuthenticatorService } from "./services/AuthenticatorService";
import { isNullOrUndefined } from "util";
import { APIService } from "./services/APIService";
import { TaskParameters } from './models/TaskParameters';
import { TaskParametersUtil } from './Utils/TaskParametersUtil';

export async function run() {
    try {
        const runId = process.env[PostTaskParameters.runId];
        const baseUri = process.env[PostTaskParameters.baseUri];
        const isRunCompleted = process.env[PostTaskParameters.isRunCompleted];

        if(!isNullOrUndefined(runId) && !isNullOrUndefined(baseUri) && (isNullOrUndefined(isRunCompleted) || isRunCompleted != 'true')) {
            console.log("Stopping the test run");
            let taskParameters: TaskParameters = await TaskParametersUtil.getTaskParameters(true);
            const authContext = new AuthenticatorService(taskParameters);
            const apiService = new APIService(authContext);
            await apiService.stopTestRun(baseUri, runId);
            console.log("Stop test-run succesful");
        }

    }
    catch(err : any) {
        CoreUtils.debug("Failed to stop the test run:" + err.message);
    }
}

run();