import { PassFailServerMetric } from "../models/PayloadModels";
import { ValidAggregateList, ValidConditionList } from "../models/UtilModels";
import { indexOfFirstDigit, removeUnits } from "./CommonUtils";

/*
    ado takes the full pf criteria as a string after parsing the string into proper data model, 
*/
export function getPassFailCriteriaFromString(passFailCriteria: (string | {[key: string]: string})[]): { [key: string]: number } {
    let failureCriteriaValue : {[key: string] : number} = {};
    passFailCriteria.forEach(criteria => {
        let criteriaString = criteria as string;
        let data = {
            aggregate: "",
            clientMetric: "",
            condition: "",
            value: "",
            requestName: "",
            action: "",
        }
        if(typeof criteria !== "string"){
            let request = Object.keys(criteria)[0]
            data.requestName = request;
            criteriaString = criteria[request]
        }
        let tempStr: string = "";
        for(let i=0; i<criteriaString.length; i++){
            if(criteriaString[i] == '('){
                data.aggregate = tempStr.trim();
                tempStr = "";
            }
            else if(criteriaString[i] == ')'){
                data.clientMetric = tempStr;
                tempStr = "";
            }
            else if(criteriaString[i] == ','){
                data.condition = tempStr.substring(0, indexOfFirstDigit(tempStr)).trim();
                data.value = tempStr.substr(indexOfFirstDigit(tempStr)).trim();
                tempStr = "";
            }
            else{
                tempStr += criteriaString[i];
            }
        }
        if(criteriaString.indexOf(',') != -1){
            data.action = tempStr.trim()
        } 
        else{
            data.condition = tempStr.substring(0, indexOfFirstDigit(tempStr)).trim();
            data.value = tempStr.substr(indexOfFirstDigit(tempStr)).trim();
        }
        validateCriteriaAndConvertToWorkingStringModel(data, failureCriteriaValue);
    });
    return failureCriteriaValue;
}

export function getServerCriteriaFromYaml(serverMetricsCriteria: any) {
    let serverPFCriteriaValue: PassFailServerMetric[] = [];
    serverMetricsCriteria.forEach((criteria: any) => {
        let data : PassFailServerMetric = {
            resourceId: criteria.resourceId,
            metricName: criteria.metricName,
            aggregation: criteria.aggregation,
            condition: criteria.condition,
            value: criteria.value,
            metricNameSpace: criteria.metricNamespace
        }
        serverPFCriteriaValue.push(data);
    });
    return serverPFCriteriaValue;
}

/*
    ado takes the full pf criteria as a string after parsing the string into proper data model, 
    this is to avoid duplicates of the data by keeping the full aggrregated metric 
    as a key and the values will be set in this function to use it further
*/
function validateCriteriaAndConvertToWorkingStringModel(data: any, failureCriteriaValue : {[key: string] : number}) {

    if(data.action == "")
        data.action = "continue"
    data.value = removeUnits(data.value);
    if(!validCriteria(data)) 
        throw new Error("Invalid Failure Criteria");
    let key: string = data.clientMetric+' '+data.aggregate+' '+data.condition+' '+data.action;
    if(data.requestName != ""){
        key = key + ' ' + data.requestName;
    }
    let val: number = parseInt(data.value);
    let currVal = val;
    
    if(failureCriteriaValue.hasOwnProperty(key))
        currVal = failureCriteriaValue[key];
    if(data.condition == '>'){
        failureCriteriaValue[key] = (val<currVal) ? val : currVal;
    }
    else{
        failureCriteriaValue[key] = (val>currVal) ? val : currVal;
    }
}

function validCriteria(data:any) {
    switch(data.clientMetric) {
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

function validResponseTimeCriteria(data:any)  {
    return !(!ValidAggregateList['response_time_ms'].includes(data.aggregate) || !ValidConditionList['response_time_ms'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}

function validRequestsPerSecondCriteria(data:any)  {
    return !(!ValidAggregateList['requests_per_sec'].includes(data.aggregate) || !ValidConditionList['requests_per_sec'].includes(data.condition)
        || data.action!= "continue");
}

function validRequestsCriteria(data:any)  {
    return !(!ValidAggregateList['requests'].includes(data.aggregate) || !ValidConditionList['requests'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}

function validLatencyCriteria(data:any)  {
    return !(!ValidAggregateList['latency'].includes(data.aggregate) || !ValidConditionList['latency'].includes(data.condition)
        || (data.value).indexOf('.')!=-1 || data.action!= "continue");
}

function validErrorCriteria(data:any)  {
    return !(!ValidAggregateList['error'].includes(data.aggregate) || !ValidConditionList['error'].includes(data.condition)
        || Number(data.value)<0 || Number(data.value)>100 || data.action!= "continue");
}