import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const data = event.queryStringParameters;
    const params = {
        TableName: "users",
        FilterExpression: "#e = :email AND NOT contains(#p, :projectId)",
        ExpressionAttributeValues: {
            ":email": data.email,
            ":projectId" : data.creator + ":::"+ data.project
        },
        ExpressionAttributeNames: {
            "#e" : "userId",
            "#p" : "projects"
        },
    };
    try {
        const result = await dynamoDbLib.call("scan", params);
        // Return the matching list of items in response body
        return success(result.Items);
    } catch (e) {
        console.log(e.message);
        return failure({ status: false });
    }
}