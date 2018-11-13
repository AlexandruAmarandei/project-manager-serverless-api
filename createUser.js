import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const data = JSON.parse(event.body);
    const params = {
        TableName: "users",
        Item: {
            userId: event.requestContext.identity.cognitoIdentityId,
            email: data.email,
            skills: data.skills,
            createdAt: Date.now(),
            projects: ["!!!empty!!!"]
        }
    };

    try {
        await dynamoDbLib.call("put", params);
        return success(params.Item);
    } catch (e) {
        return failure({ status: false });
    }
}