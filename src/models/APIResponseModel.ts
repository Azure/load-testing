export interface Definitions {
    /**
     * Response for a feature flag query
     */
    FeatureFlagResponse: {
        featureFlag: string;
        enabled: boolean;
    };
}
