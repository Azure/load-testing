"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileStatus = exports.ManagedIdentityTypeForAPI = exports.FileType = exports.CertificateMetadata = void 0;
class CertificateMetadata {
}
exports.CertificateMetadata = CertificateMetadata;
;
;
;
;
;
var FileType;
(function (FileType) {
    FileType["JMX_FILE"] = "JMX_FILE";
    FileType["USER_PROPERTIES"] = "USER_PROPERTIES";
    FileType["ADDITIONAL_ARTIFACTS"] = "ADDITIONAL_ARTIFACTS";
    FileType["ZIPPED_ARTIFACTS"] = "ZIPPED_ARTIFACTS";
    FileType["URL_TEST_CONFIG"] = "URL_TEST_CONFIG";
    FileType["TEST_SCRIPT"] = "TEST_SCRIPT";
})(FileType = exports.FileType || (exports.FileType = {}));
;
;
;
;
var ManagedIdentityTypeForAPI;
(function (ManagedIdentityTypeForAPI) {
    ManagedIdentityTypeForAPI["SystemAssigned"] = "SystemAssigned";
    ManagedIdentityTypeForAPI["UserAssigned"] = "UserAssigned";
    ManagedIdentityTypeForAPI["None"] = "None";
})(ManagedIdentityTypeForAPI = exports.ManagedIdentityTypeForAPI || (exports.ManagedIdentityTypeForAPI = {}));
var FileStatus;
(function (FileStatus) {
    FileStatus["NOT_VALIDATED"] = "NOT_VALIDATED";
    FileStatus["VALIDATION_SUCCESS"] = "VALIDATION_SUCCESS";
    FileStatus["VALIDATION_FAILURE"] = "VALIDATION_FAILURE";
    FileStatus["VALIDATION_INITIATED"] = "VALIDATION_INITIATED";
    FileStatus["VALIDATION_NOT_REQUIRED"] = "VALIDATION_NOT_REQUIRED";
})(FileStatus = exports.FileStatus || (exports.FileStatus = {}));
