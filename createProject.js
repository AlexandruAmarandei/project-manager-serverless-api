import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context){
    const data = JSON.parse(event.body);

    const paramsToCheckTable = {
        TableName: "projects",
        Key: {
            projectId: data.email + ":::"  + data.projectName,
        },
        ReturnValues: "ALL_NEW"
    };
    var table;
    try {
        table = await dynamoDbLib.call("get", paramsToCheckTable);
    } catch (e) {
        return failure({ status: false });
    }


    if(table.Item !== undefined){
        return success({ status: false });
    }

    const paramsToGetUser = {
        TableName: "users",
        Key: {
            userId: data.email,
        },
        ReturnValues: "ALL_NEW"
    };
    var userToAddTo;
    try {
        userToAddTo = await dynamoDbLib.call("get", paramsToGetUser);
    } catch (e) {
        return failure({ status: false });
    }
    if(userToAddTo.Item.projects[0] === "!!!empty!!!"){
        const paramsForUserUpdate = {
            TableName: "users",
            Key: {
                userId: data.email,
            },
            UpdateExpression: "SET  projects = :projectId",
            ExpressionAttributeValues: {
                ":projectId": [data.email + ":::"  + data.projectName]
            },
            ReturnValues: "ALL_NEW"
        };

        try {
            const result = await dynamoDbLib.call("update", paramsForUserUpdate);
        } catch (e) {
            console.log(e.message);
            return failure({ status: "Could not add user to project" });
        }
    }else {

        const paramsForUserUpdate = {
            TableName: "users",
            Key: {
                userId: data.email,
            },
            UpdateExpression: "SET  projects = list_append(projects, :projectId)",
            ExpressionAttributeValues: {
                ":projectId": [data.email + ":::"  + data.projectName]
            },
            ReturnValues: "ALL_NEW"
        };
        try {
            const result = await dynamoDbLib.call("update", paramsForUserUpdate);
        } catch (e) {
            return failure({ status: "Could not add user to project" });
        }
    }




    var params = {
        TableName: "projects",
        Item: {
            projectId: data.email + ":::"  + data.projectName,
            projectName : data.projectName,
            manager : data.email,
            participants: [data.email],
            description: data.description,
            status: "active",
            createdAt: Date.now()
        }
    };

    try {
        await dynamoDbLib.call("put", params);
        return success(params.Item);
    } catch (e) {
        return failure({ status: e.message });
    }
}