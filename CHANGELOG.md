# Changelog

All notable changes to the Azure Load Testing GitHub Action will be documented in this file.

## [v1] - 2025-11

### Recommended Version
**v1 is the recommended version for all users.**

### Changed
- Updated data plane token scope from `https://loadtest.azure-dev.com` to `https://cnt-prod.loadtesting.azure.com` for production Azure Load Testing service.

## [v1] - Previous Release

### Features
- Initial release of Azure Load Testing GitHub Action
- Support for running load tests with Azure Load Testing service
- Integration with GitHub Actions workflows
- Support for JMeter scripts, Locust tests, and URL-based tests
- Pass/Fail criteria configuration
- Secret and environment variable injection
- Multi-region testing support
