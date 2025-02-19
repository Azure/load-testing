import * as util from './models/FileUtils';
import { resultFolder } from "./models/UtilModels";
import * as fs from 'fs';
import * as core from '@actions/core';
import { AuthenticationUtils } from "./models/AuthenticationUtils";
import { YamlConfig } from "./models/TaskModels";
import { APISupport } from "./models/APISupport";

async function run() {
    try {

        let authContext = new AuthenticationUtils();
        let yamlConfig = new YamlConfig();
        let apiSupport = new APISupport(authContext, yamlConfig);

        await authContext.authorize();
        await apiSupport.getResource();
        await apiSupport.getTestAPI(false);
        if (fs.existsSync(resultFolder)){
            util.deleteFile(resultFolder);
        }

        fs.mkdirSync(resultFolder);
        await apiSupport.createTestAPI();

    }
    catch (err:any) {
        core.setFailed(err.message);
    }
}

run();