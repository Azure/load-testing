import path = require('path');
import { FetchCallType, ContentTypeMap, TokenScope } from "../models/UtilModels";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { IHeaders } from "typed-rest-client/Interfaces";
import { TaskParameters } from "../models/TaskParameters";
import * as AzCliUtility from '../Utils/AzCliUtility';

export class AuthenticatorService {
    public taskParameters: TaskParameters;

    private dataPlanetoken : string = '';
    private controlPlaneToken : string = '';

    constructor(taskParameters: TaskParameters) {
        this.taskParameters = taskParameters;
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
        // right now only get calls from the GH, so no need of content type for now for the get calls.
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