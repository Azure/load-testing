import { isNullOrUndefined } from "util";
import * as TaskLibUtils from './TaskLibUtils';
import * as InputConstants from "../Constants/InputConstants";
import * as EnvironmentConstants from "../Constants/EnvironmentConstants";
import { TaskParameters } from "../models/TaskParameters";

export class TaskParametersUtil {

    public static getTaskParameters(isPostProcessJob: boolean = false): TaskParameters {
        let taskParameters: TaskParameters = {
            subscriptionId: '',
            environment: EnvironmentConstants.AzurePublicCloud.cloudName,
            armTokenScope: EnvironmentConstants.AzurePublicCloud.armTokenScope,
            dataPlaneTokenScope: EnvironmentConstants.AzurePublicCloud.dataPlaneTokenScope,
            resourceId: '',
            serviceConnectionName: '',
            authorizationScheme: '',
            armEndpoint: EnvironmentConstants.AzurePublicCloud.armEndpoint,
            authorityHostUrl: EnvironmentConstants.AzurePublicCloud.authorityHostUrl,
        };

        taskParameters.serviceConnectionName = TaskLibUtils.getInput(InputConstants.serviceConnectionName) ?? '';
        if(isNullOrUndefined(taskParameters.serviceConnectionName) || taskParameters.serviceConnectionName == '') {
            throw new Error(`The input field "azureSubscription" is empty. Provide an existing service connection`);
        }

        // Post process job does not require resource parameters
        if (!isPostProcessJob) {
            this.setResourceParameters(taskParameters);
        }

        taskParameters.authorityHostUrl = TaskLibUtils.getEndpointDataParameter(taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authorityUrl) ?? taskParameters.authorityHostUrl;
        taskParameters.armEndpoint = TaskLibUtils.getEndpointUrl(taskParameters.serviceConnectionName) ?? taskParameters.armEndpoint;
        
        taskParameters.environment = TaskLibUtils.getEndpointDataParameter(taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.environment) ?? EnvironmentConstants.AzurePublicCloud.cloudName;
        if(taskParameters.environment.toLowerCase() == EnvironmentConstants.AzureUSGovernmentCloud.cloudName.toLowerCase()) {
            taskParameters.dataPlaneTokenScope = EnvironmentConstants.AzureUSGovernmentCloud.dataPlaneTokenScope;
            taskParameters.armTokenScope = EnvironmentConstants.AzureUSGovernmentCloud.armTokenScope;
        }

        taskParameters.authorizationScheme = TaskLibUtils.getEndpointAuthorizationScheme(taskParameters.serviceConnectionName) ?? '';

        return taskParameters;
    }

    private static setResourceParameters(taskParameters: TaskParameters) {
        taskParameters.subscriptionId = TaskLibUtils.getEndpointDataParameter(taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.subscriptionId) ?? '';
        if(isNullOrUndefined(taskParameters.subscriptionId) || taskParameters.subscriptionId == '') {
            throw new Error(`The subscription assigned to the service connection is empty. Provide an proper service connection with an SPN assigned to it.`);
        }

        const resourceGroup: string | undefined = TaskLibUtils.getInput(InputConstants.resourceGroup);
        const loadTestResourceName: string | undefined = TaskLibUtils.getInput(InputConstants.loadTestResource);
        if(isNullOrUndefined(resourceGroup) || resourceGroup == ''){
            throw new Error(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
        }
        if(isNullOrUndefined(loadTestResourceName) || loadTestResourceName == ''){
            throw new Error(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
        }
        taskParameters.resourceId = "/subscriptions/"+taskParameters.subscriptionId+"/resourcegroups/"+resourceGroup+"/providers/microsoft.loadtestservice/loadtests/"+loadTestResourceName;
    }
}