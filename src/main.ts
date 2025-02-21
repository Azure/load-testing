import * as util from './models/FileUtils';
import { PostTaskParameters, resultFolder } from "./models/UtilModels";
import * as fs from 'fs';
import * as CoreUtils from './models/CoreUtils';
import { createAndRunTest } from "./models/CreateAndRunTest";
import { AuthenticationUtils } from "./models/AuthenticationUtils";
import { APIService } from './models/APIService';

async function run() {
    try {

        let authContext = new AuthenticationUtils();
        let apiService = new APIService(authContext);

        await authContext.authorize();
        let dataPlaneUrl = await apiService.getDataPlaneURL(authContext.resourceId);
        
        apiService.setBaseURL(dataPlaneUrl);
        CoreUtils.exportVariable(PostTaskParameters.baseUri, apiService.baseURL);

        if (fs.existsSync(resultFolder)){
            util.deleteFile(resultFolder);
        }
        fs.mkdirSync(resultFolder);
        
        await createAndRunTest(apiService);
    }
    catch (err:any) {
        CoreUtils.setFailed(err.message);
    }
}

run();