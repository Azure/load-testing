import * as util from './Utils/FileUtils';
import { PostTaskParameters, resultFolder } from "./models/UtilModels";
import * as fs from 'fs';
import * as CoreUtils from './Utils/CoreUtils';
import { AuthenticatorService } from "./services/AuthenticatorService";
import { CreateAndRunTest } from "./RunnerFiles/CreateAndRunTest";
import { APIService } from './services/APIService';
import { TaskParameters } from './models/TaskParameters';
import { TaskParametersUtil } from './Utils/TaskParametersUtil';

async function run() {
    try {
        let taskParameters: TaskParameters = await TaskParametersUtil.getTaskParameters();
        let authContext = new AuthenticatorService(taskParameters);
        let apiService = new APIService(authContext);

        let dataPlaneUrl = await apiService.getDataPlaneURL(taskParameters.resourceId);
        
        apiService.setBaseURL(dataPlaneUrl);
        CoreUtils.exportVariable(PostTaskParameters.baseUri, apiService.baseURL);

        if (fs.existsSync(resultFolder)){
            util.deleteFile(resultFolder);
        }
        fs.mkdirSync(resultFolder);
        
        let runner = new CreateAndRunTest(apiService);
        runner.createAndRunTest();
    }
    catch (err:any) {
        CoreUtils.setFailed(err.message);
    }
}

run();