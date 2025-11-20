"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPassFailCriteriaFromString = getPassFailCriteriaFromString;
exports.getServerCriteriaFromYaml = getServerCriteriaFromYaml;
const UtilModels_1 = require("../models/UtilModels");
const CommonUtils_1 = require("./CommonUtils");
/*
    ado takes the full pf criteria as a string after parsing the string into proper data model,
*/
function getPassFailCriteriaFromString(passFailCriteria) {
    let failureCriteriaValue = {};
    passFailCriteria.forEach(criteria => {
        let criteriaString = criteria;
        let data = {
            aggregate: "",
            clientMetric: "",
            condition: "",
            value: "",
            requestName: "",
            action: "",
        };
        if (typeof criteria !== "string") {
            let request = Object.keys(criteria)[0];
            data.requestName = request;
            criteriaString = criteria[request];
        }
        let tempStr = "";
        for (let i = 0; i < criteriaString.length; i++) {
            if (criteriaString[i] == '(') {
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if (criteriaString[i] == ')') {
                data.clientMetric = tempStr;
                tempStr = "";
            }
            else if (criteriaString[i] == ',') {
                data.condition = tempStr.substring(0, (0, CommonUtils_1.indexOfFirstDigit)(tempStr)).trim();
                data.value = tempStr.substr((0, CommonUtils_1.indexOfFirstDigit)(tempStr)).trim();
                tempStr = "";
            }
            else {
                tempStr += criteriaString[i];
            }
        }
        if (criteriaString.indexOf(',') != -1) {
            data.action = tempStr.trim();
        }
        else {
            data.condition = tempStr.substring(0, (0, CommonUtils_1.indexOfFirstDigit)(tempStr)).trim();
            data.value = tempStr.substr((0, CommonUtils_1.indexOfFirstDigit)(tempStr)).trim();
        }
        validateCriteriaAndConvertToWorkingStringModel(data, failureCriteriaValue);
    });
    return failureCriteriaValue;
}
function getServerCriteriaFromYaml(serverMetricsCriteria) {
    let serverPFCriteriaValue = [];
    serverMetricsCriteria.forEach((criteria) => {
        let data = {
            resourceId: criteria.resourceId,
            metricName: criteria.metricName,
            aggregation: criteria.aggregation,
            condition: criteria.condition,
            value: criteria.value,
            metricNameSpace: criteria.metricNamespace
        };
        serverPFCriteriaValue.push(data);
    });
    return serverPFCriteriaValue;
}
/*
    ado takes the full pf criteria as a string after parsing the string into proper data model,
    this is to avoid duplicates of the data by keeping the full aggrregated metric
    as a key and the values will be set in this function to use it further
*/
function validateCriteriaAndConvertToWorkingStringModel(data, failureCriteriaValue) {
    if (data.action == "")
        data.action = "continue";
    data.value = (0, CommonUtils_1.removeUnits)(data.value);
    if (!validCriteria(data))
        throw new Error("Invalid Failure Criteria");
    let key = data.clientMetric + ' ' + data.aggregate + ' ' + data.condition + ' ' + data.action;
    if (data.requestName != "") {
        key = key + ' ' + data.requestName;
    }
    let val = parseInt(data.value);
    let currVal = val;
    if (failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if (data.condition == '>') {
        failureCriteriaValue[key] = (val < currVal) ? val : currVal;
    }
    else {
        failureCriteriaValue[key] = (val > currVal) ? val : currVal;
    }
}
function validCriteria(data) {
    switch (data.clientMetric) {
        case "response_time_ms":
            return validResponseTimeCriteria(data);
        case "requests_per_sec":
            return validRequestsPerSecondCriteria(data);
        case "requests":
            return validRequestsCriteria(data);
        case "latency":
            return validLatencyCriteria(data);
        case "error":
            return validErrorCriteria(data);
        default:
            return false;
    }
}
function validResponseTimeCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['response_time_ms'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['response_time_ms'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validRequestsPerSecondCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['requests_per_sec'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['requests_per_sec'].includes(data.condition)
        || data.action != "continue");
}
function validRequestsCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['requests'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['requests'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validLatencyCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['latency'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['latency'].includes(data.condition)
        || (data.value).indexOf('.') != -1 || data.action != "continue");
}
function validErrorCriteria(data) {
    return !(!UtilModels_1.ValidAggregateList['error'].includes(data.aggregate) || !UtilModels_1.ValidConditionList['error'].includes(data.condition)
        || Number(data.value) < 0 || Number(data.value) > 100 || data.action != "continue");
}
