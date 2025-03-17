import * as CoreUtils from '../Utils/CoreUtils';
import path = require('path');
import * as fs from 'fs';
import { AuthenticationContext } from "adal-node";
import { FetchCallType, ContentTypeMap, TokenScope } from "../models/UtilModels";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { IHeaders } from "typed-rest-client/Interfaces";
import * as InputConstants from "../Constants/InputConstants";
import * as EnvironmentConstants from "../Constants/EnvironmentConstants";
import { TaskParameters } from "../models/TaskParameters";
import * as AzCliUtility from '../Utils/AzCliUtility';

export class AuthenticatorService {
    public taskParameters: TaskParameters;

    private dataPlanetoken : string = '';
    private controlPlaneToken : string = '';
    private clientId: string = '';
    private tenantId: string = '';
    private clientkey: string = '';

    constructor(taskParameters: TaskParameters) {
        this.taskParameters = taskParameters;
    }

    public async authorize() {
        const isE2ETest = process.argv.includes("--e2e");
        if(isE2ETest) {
            TaskLibUtils.debug('Skipping authorization for e2e tests');
            return;
        }
        
        if (this.taskParameters.authorizationScheme.toLowerCase() === 'serviceprincipal') {
            if (!this.clientId || this.clientId == '') {
                this.setServicePrincipalInputs();
            }
        }
        else {
            if(this.taskParameters.environment.toLowerCase() != EnvironmentConstants.AzurePublicCloud.cloudName.toLowerCase()) {
                TaskLibUtils.execSync('az', ['cloud', 'set', '--name', this.taskParameters.environment]);
            }

            await loginAzureRM(this.taskParameters.serviceConnectionName);
        }
    }

    public async getDataPlaneHeader(apicallType : FetchCallType) : Promise<IHeaders> {
        if(!this.isTokenValid(TokenScope.Dataplane)) {
            let tokenRes:any = await this.getTokenAPI(TokenScope.Dataplane);
            this.dataPlanetoken = tokenRes;
        }
        let headers: IHeaders = {
            'content-type': ContentTypeMap[apicallType] ?? 'application/json',
            'Authorization': 'Bearer '+ this.dataPlanetoken
        };
        return headers;
    }

    public async getARMTokenHeader() {
        // right now only get calls from the ADO, so no need of content type for now for the get calls.
        var tokenRes:any = await this.getTokenAPI(TokenScope.ControlPlane);
        this.controlPlaneToken = tokenRes;
        let headers: IHeaders = {
            'Authorization': 'Bearer '+ this.controlPlaneToken,
        };
        return headers;
    }

    private async getTokenAPI(scope: TokenScope) 
    {
        let tokenScopeDecoded = scope == TokenScope.Dataplane ? this.taskParameters.dataPlaneTokenScope : this.taskParameters.armTokenScope;
        if (this.taskParameters.authorizationScheme.toLowerCase() != 'serviceprincipal') {
            try {
                const cmdArguments = ["account", "get-access-token", "--resource"];
                cmdArguments.push(tokenScopeDecoded);
                let result: any = await AzCliUtility.execAz(cmdArguments);
                let token = result.accessToken;
                scope == TokenScope.ControlPlane ? this.controlPlaneToken = token : this.dataPlanetoken = token;
                return token;
            } 
            catch (err:any) {
                const message =
                    `An error occurred while getting credentials from ` + `Azure CLI: ${err.message}`;
                throw new Error(message);
            }
        }
        else{
            if  (!this.clientId || this.clientId == '') {
                this.setServicePrincipalInputs();
            }

            var authorityUrl = new URL(this.tenantId, this.taskParameters.authorityHostUrl);
            var context = new AuthenticationContext(authorityUrl.toString());
            let tokenRes:any = await new Promise((resolve, reject) => {
                context.acquireTokenWithClientCredentials(tokenScopeDecoded, this.clientId, this.clientkey, (err:any, token:any) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(token);
                    }
                });
            });
            scope == TokenScope.ControlPlane ? this.controlPlaneToken = tokenRes.accessToken : this.dataPlanetoken = tokenRes.accessToken;
            return tokenRes.accessToken;
        }
    }

    private setServicePrincipalInputs() {

        let authType = TaskLibUtils.getEndpointAuthorizationParameter(this.taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.authenticationType, true) ?? '';
        this.clientId = TaskLibUtils.getEndpointAuthorizationParameter(this.taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalId, false) ?? '';
        this.tenantId = TaskLibUtils.getEndpointAuthorizationParameter(this.taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.tenantId, false) ?? ''; // needed only for scn, so throwing error in the service connection.
        if(this.tenantId == '' || this.clientId == '') {
            throw new Error("Invalid service connection");
        }

        if(authType.toLowerCase() === 'spncertificate') {
            let workingDir = TaskLibUtils.getVariable('Agent.TempDirectory') || TaskLibUtils.getVariable('system.DefaultWorkingDirectory') || '';
            this.clientkey = path.join(workingDir, 'spnCert.pem');

            TaskLibUtils.debug('certificate based endpoint');
            let certificateContent = TaskLibUtils.getEndpointAuthorizationParameter(this.taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalCertificate, false);
            
            try{
                if(!certificateContent){
                    throw new Error();
                }
                fs.writeFileSync(this.clientkey, certificateContent);
            }
            catch{
                throw new Error("ClientKey/spnCertificate is invalid");
            }
        }
        else {
            TaskLibUtils.debug('key based endpoint');
            this.clientkey = TaskLibUtils.getEndpointAuthorizationParameter(this.taskParameters.serviceConnectionName, InputConstants.serviceConnectionInputs.servicePrincipalKey, false) ?? '';
        }

        if (this.clientkey == '') {
            throw new Error(`Invalid service connection. Client key is empty.`);
        }

        let escapedCliPassword = this.clientkey.replace(/"/g, '\\"');
        TaskLibUtils.setSecret(escapedCliPassword.replace(/\\/g, '\"'));
    }

    private isTokenValid(scope: TokenScope) {
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
}