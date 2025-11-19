# Changelog

All notable changes to the Azure Load Testing GitHub Action will be documented in this file.

## [v2] - 2025-11

### Recommended Version
**v2 is now the recommended version for all users.**

### Changed
- Updated data plane token scope from `https://loadtest.azure-dev.com` to `https://cnt-prod.loadtesting.azure.com` for production Azure Load Testing service.

### Migration Guide
To migrate from v1 to v2, update your workflow file:

```yaml
# Before (v1)
- uses: azure/load-testing@v1

# After (v2)
- uses: azure/load-testing@v2
```

No other changes are required. All existing functionality and parameters remain the same.

## [v1] - Previous Release

### Features
- Initial release of Azure Load Testing GitHub Action
- Support for running load tests with Azure Load Testing service
- Integration with GitHub Actions workflows
- Support for JMeter scripts, Locust tests, and URL-based tests
- Pass/Fail criteria configuration
- Secret and environment variable injection
- Multi-region testing support
