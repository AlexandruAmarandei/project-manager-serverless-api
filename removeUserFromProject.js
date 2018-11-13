import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {

    const data = JSON.parse(event.body);
    const projectNameId = data.email + ":::"  + data.projectName;
    const getParams = {
        TableName: "projects",

        KeyConditionExpression: "projectId = :projectId",
        ExpressionAttributeValues: {
            ":projectId": projectNameId
        },
        ProjectionExpression: "participants"
    };

    var projectUsers;
    try {
        projectUsers = await dynamoDbLib.call("query", getParams);
    } catch (e) {
        return failure({ status: false });
    }
    var participantList =  projectUsers.Items[0].participants;
    var position = 0;
    while(participantList[position]){
        if(participantList[position] === data.userToRemove) {
            break;
        }
        position++;
    }
    if(!participantList[position]){
        return failure({ status: "Did not found entry in table" });
    }
    participantList.splice(position, 1);

    const params = {
        TableName: "projects",

        Key: {
            projectId: projectNameId,
        },

        UpdateExpression: "SET participants = :participants",
        ExpressionAttributeValues: {
            ":participants": participantList
        },

        ReturnValues: "ALL_NEW"
    };

    try {
        const result = await dynamoDbLib.call("update", params);
    } catch (e) {
        return failure({ status: "Could not remove user from project" });
    }


    const paramsForUserRemoval = {
        TableName: "users",
        KeyConditionExpression: " userId = :userId",
        ExpressionAttributeValues: {
            ":userId": data.userToRemove
        },
        ReturnValues: "ALL_NEW"
    };

    var userToRemoveProjFrom;
    try {
        userToRemoveProjFrom = await dynamoDbLib.call("query", paramsForUserRemoval);
    } catch (e) {
        return failure({ status: "Could not find user" });
    }
    var projectsOfUser = userToRemoveProjFrom.Items[0].projects;
    var position2, count;
    position2 = -1;
    for(count = 0; projectsOfUser[count];count++){
        if(projectsOfUser[count] === projectNameId){
            position2 = count;
        }
    }
    if(position2 === -1){
        return success({ status: "Did not find project for user but removed user from project" });
    }
    var toReplace;
    if(count=== 1){
        toReplace = ["!!!empty!!!"];
    }
    else{
        projectsOfUser.splice(position2, 1);
        toReplace = projectsOfUser;
    }

    const paramsForProjectRemovalFromUser = {
        TableName: "users",
        Key: {
            userId: data.userToRemove,
        },

        UpdateExpression: "SET projects = :projects",
        ExpressionAttributeValues: {
            ":projects": toReplace
        },


        ReturnValues: "ALL_NEW"
    };
    try {
        const result = await dynamoDbLib.call("update", paramsForProjectRemovalFromUser);
        return success({ status: true });
    } catch (e) {
        console.log(e.message);
        return failure({ status: "Could not remove project from user" });
    }

}