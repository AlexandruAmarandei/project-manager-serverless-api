import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const params = {
        TableName: "projects",
        FilterExpression: "contains (#p, :participant) AND #m <> :participant",
        ExpressionAttributeValues: {
            ":participant": event.queryStringParameters.email
        },
        ExpressionAttributeNames: {
            "#p" : "participants",
            "#m" : "manager"
        },
        ProjectionExpression: "projectId, entryId, projectName, manager"

    };


    try {
        const result = await dynamoDbLib.call("scan", params);
        // Return the matching list of items in response body
        return success(result.Items);
    } catch (e) {
        return failure({ status: e.message });
    }
}