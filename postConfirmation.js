import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
    const params = {
        TableName: "users",
        Item: {
            userId: event.request.userAttributes.email,
            cognitoId: event.request.userAttributes.sub,
            projects: ["!!!empty!!!"],
            skills: ["!!!empty!!!"],
            createdAt: Date.now()
        }
    };

    try {
        await dynamoDbLib.call("put", params);
        callback(null, event);
    } catch (e) {
        callback(null, event);
    }
}