import { isNullOrUndefined } from "util";
import * as CoreUtils from './CoreUtils';
import * as InputConstants from "../Constants/InputConstants";
import * as EnvironmentConstants from "../Constants/EnvironmentConstants";
import { TaskParameters } from "../models/TaskParameters";
import * as AzCliUtility from '../Utils/AzCliUtility';

export class TaskParametersUtil {

    public static async getTaskParameters(isPostProcessJob: boolean = false): Promise<TaskParameters> {
        let taskParameters: TaskParameters = {
            subscriptionId: '',
            subscriptionName: '',
            environment: EnvironmentConstants.AzurePublicCloud.cloudName,
            armTokenScope: EnvironmentConstants.AzurePublicCloud.armTokenScope,
            dataPlaneTokenScope: EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope,
            resourceId: '',
            armEndpoint: EnvironmentConstants.AzurePublicCloud.armEndpoint,
        };

        // Post process job does not require resource parameters
        if (!isPostProcessJob) {
            await this.setSubscriptionParameters(taskParameters);
            this.setResourceParameters(taskParameters);
        }

        await this.setEndpointAndScopeParameters(taskParameters);

        return taskParameters;
    }

    private static setResourceParameters(taskParameters: TaskParameters) {
        const resourceGroup: string | undefined = CoreUtils.getInput(InputConstants.resourceGroup);
        const loadTestResourceName: string | undefined = CoreUtils.getInput(InputConstants.loadTestResource);
        if(isNullOrUndefined(resourceGroup) || resourceGroup == ''){
            throw new Error(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
        }
        if(isNullOrUndefined(loadTestResourceName) || loadTestResourceName == ''){
            throw new Error(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
        }
        taskParameters.resourceId = "/subscriptions/"+taskParameters.subscriptionId+"/resourcegroups/"+resourceGroup+"/providers/microsoft.loadtestservice/loadtests/"+loadTestResourceName;
    }

    private static async setSubscriptionParameters(taskParameters: TaskParameters) {
        try {
            const cmdArguments = ["account", "show"];
            var result: any = await AzCliUtility.execAz(cmdArguments);

            taskParameters.subscriptionId = result.id;
            taskParameters.subscriptionName = result.name;
        } 
        catch (err: any) {
            const message =
            `An error occurred while getting credentials from ` +
            `Azure CLI for getting subscription name: ${err.message}`; 
            throw new Error(message);
        }
    }

    private static async setEndpointAndScopeParameters(taskParameters: TaskParameters) {
        try 
        {
            const cmdArguments = ["cloud", "show"];
            var result: any = await AzCliUtility.execAz(cmdArguments);
            let env = result ? result.name : null;
            taskParameters.environment = env ?? EnvironmentConstants.AzurePublicCloud.cloudName;

            let endpointUrl = (result && result.endpoints) ? result.endpoints.resourceManager : null;
            taskParameters.armEndpoint = endpointUrl ?? taskParameters.armEndpoint;

            if(taskParameters.environment.toLowerCase() == EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toLowerCase()) {
                taskParameters.dataPlaneTokenScope = EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope;
                taskParameters.armTokenScope = EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope;
            }
        }
        catch (err: any) {
            const message =
            `An error occurred while getting credentials from ` +
            `Azure CLI for setting endPoint and scope: ${err.message}`;
            throw new Error(message);
        }
    }
}