import { isNullOrUndefined } from "util";
import { execFile } from "child_process";
import { FetchCallType, ContentTypeMap, TokenScope } from "./UtilModels";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { IHeaders } from "typed-rest-client/Interfaces";
import * as InputConstants from "./InputConstants";
import * as CoreUtils from './CoreUtils';

export class AuthenticationUtils {
    dataPlanetoken : string = '';
    controlPlaneToken : string = '';
    subscriptionId : string = '';
    env: string = 'AzureCloud';
    armTokenScope='https://management.core.windows.net';
    dataPlaneTokenScope='https://loadtest.azure-dev.com';
    armEndpoint='https://management.azure.com';

    resourceId : string = '';
    subscriptionName: string = '';

    constructor() {}

    async authorize() {
        // NOTE: This will set the subscription id
        await this.getTokenAPI(TokenScope.ControlPlane);
        this.subscriptionName = await this.getSubName();
        const rg: string | undefined = CoreUtils.getInput(InputConstants.resourceGroup);
        const ltres: string | undefined = CoreUtils.getInput(InputConstants.loadTestResource);
        if(isNullOrUndefined(rg) || rg == ''){
            throw new Error(`The input field "${InputConstants.resourceGroupLabel}" is empty. Provide an existing resource group name.`);
        }
        if(isNullOrUndefined(ltres) || ltres == ''){
            throw new Error(`The input field "${InputConstants.loadTestResourceLabel}" is empty. Provide an existing load test resource name.`);
        }
        this.resourceId = "/subscriptions/"+this.subscriptionId+"/resourcegroups/"+rg+"/providers/microsoft.loadtestservice/loadtests/"+ltres;

        await this.setEndpointAndScope();
    }

    async setEndpointAndScope() {
        try 
        {
            const cmdArguments = ["cloud", "show"];
            var result: any = await this.execAz(cmdArguments);
            let env = result ? result.name : null;
            this.env = env ? env : this.env;
            let endpointUrl = (result && result.endpoints) ? result.endpoints.resourceManager : null;
            this.armEndpoint = endpointUrl ? endpointUrl : this.armEndpoint;

            if(this.env == 'AzureUSGovernment'){
                this.dataPlaneTokenScope = 'https://cnt-prod.loadtesting.azure.us';
                this.armTokenScope = 'https://management.usgovcloudapi.net';
            }
        }
        catch (err: any) {
            const message =
            `An error occurred while getting credentials from ` +
            `Azure CLI for setting endPoint and scope: ${err.message}`;
            throw new Error(message);
        }
    }

    async getTokenAPI(scope: TokenScope) 
    {
        let tokenScopeDecoded = scope == TokenScope.Dataplane ? this.dataPlaneTokenScope : this.armTokenScope;
        try {
            const cmdArguments = ["account", "get-access-token", "--resource"];
            cmdArguments.push(tokenScopeDecoded);
            var result: any = await this.execAz(cmdArguments);
            let token = result.accessToken;
            
            // NOTE: Setting the subscription id
            this.subscriptionId = result.subscription;
            scope == TokenScope.ControlPlane ? this.controlPlaneToken = token : this.dataPlanetoken = token;
            return token;
        } 
        catch (err:any) {
            const message =
                `An error occurred while getting credentials from ` + `Azure CLI: ${err.message}`;
            throw new Error(message);
        }
    }

    async execAz(cmdArguments: string[]): Promise<any> {
        const azCmd = process.platform === "win32" ? "az.cmd" : "az";
        return new Promise<any>((resolve, reject) => {
            execFile(azCmd, [...cmdArguments, "--out", "json"], { encoding: "utf8", shell : true }, (error:any, stdout:any) => {
                if (error) {
                    return reject(error);
                }
                try {
                    return resolve(JSON.parse(stdout));
                } catch (err:any) {
                    const msg =
                        `An error occurred while parsing the output "${stdout}", of ` +
                        `the cmd az "${cmdArguments}": ${err.message}.`;
                    return reject(new Error(msg));
                }
            });
        });
    }

    isValid(scope: TokenScope) {
        let token = scope == TokenScope.Dataplane ? this.dataPlanetoken : this.controlPlaneToken;
        try {
            let header = token && jwtDecode<JwtPayload>(token);
            const now = Math.floor(Date.now() / 1000)
            return (header && header?.exp && header.exp + 2 > now);
        }
        catch(error:any) {
            console.log("Error in getting the token");
        }
    }

    async getDataPlaneHeader(apicallType : FetchCallType) : Promise<IHeaders> {
        if(!this.isValid(TokenScope.Dataplane)) {
            let tokenRes:any = await this.getTokenAPI(TokenScope.Dataplane);
            this.dataPlanetoken = tokenRes;
        }
        let headers: IHeaders = {
            'content-type': ContentTypeMap[apicallType] ?? 'application/json',
            'Authorization': 'Bearer '+ this.dataPlanetoken
        };
        return headers;
    }
    
    async getSubName() {
        try {
            const cmdArguments = ["account", "show"];
            var result: any = await this.execAz(cmdArguments);
            let name = result.name;
            return name;
        } catch (err: any) {
            const message =
            `An error occurred while getting credentials from ` +
            `Azure CLI for getting subscription name: ${err.message}`; 
            throw new Error(message);
        }
    }

    async armTokenHeader() {
        // right now only get calls from the GH, so no need of content type for now for the get calls.
        var tokenRes:any = await this.getTokenAPI(TokenScope.ControlPlane);
        this.controlPlaneToken = tokenRes;
        let headers: IHeaders = {
            'Authorization': 'Bearer '+ this.controlPlaneToken,
        };
        return headers;
    }
}