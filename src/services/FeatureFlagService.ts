import { FeatureFlags } from "./FeatureFlags";
import { Definitions } from "../models/APIResponseModel";
import { APIRoute } from "../constants";
import * as map from '../mappers';
import * as util from '../util';
import { IHeaders } from "typed-rest-client/Interfaces";

export class FeatureFlagService {
    private static featureFlagCache: { [key: string]: boolean } = {};

    public static async getFeatureFlagAsync(flag: FeatureFlags, baseUrl: string, useCache: boolean = true): Promise<Definitions['FeatureFlagResponse'] | null> {
        if (useCache && flag in this.featureFlagCache) {
            return {featureFlag: flag, enabled: this.featureFlagCache[flag.toString()]};
        }

        let uri: string = baseUrl + APIRoute.FeatureFlags(flag.toString());
        let headers: IHeaders = {
            'content-type': 'application/json',
            'Authorization': 'Bearer '+ map.getToken()
        };
        let flagResponse = await util.httpClientRetries(uri, headers, 'get', 3, "", false, false);
        try {
            let flagObj = (await util.getResultObj(flagResponse)) as Definitions["FeatureFlagResponse"];
            this.featureFlagCache[flag.toString()] = flagObj.enabled;
            return flagObj;
        }
        catch (error) {
            // remove item from dict
            // handle in case getFlag was called with cache true once and then with cache false, and failed during second call
            // remove the item from cache so that it can be fetched again rather than using old value
            delete this.featureFlagCache[flag.toString()];
            return null;
        }
    }

    public static async isFeatureEnabledAsync(flag: FeatureFlags, baseUrl: string, useCache: boolean = true): Promise<boolean> {
        let flagObj = await this.getFeatureFlagAsync(flag, baseUrl, useCache);
        return flagObj ? flagObj.enabled : false;
    }
}