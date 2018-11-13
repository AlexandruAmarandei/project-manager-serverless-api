import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const params = {
        TableName: "users",
        Key: {
            userId: event.queryStringParameters.email
        }
    };

    try {
        const result = await dynamoDbLib.call("get", params);
        if (result.Item) {
            return success(result.Item);
        } else {
            return failure({ status: false, error: "User not found!" });
        }
    } catch (e) {
        return failure({ status: false });
    }
}