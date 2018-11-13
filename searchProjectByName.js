import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const data = event.queryStringParameters;
    if(data.match === ""){
        const params = {
            TableName: "projects",
        };
        try {
            const result = await dynamoDbLib.call("scan", params);
            return success(result.Items);
        } catch (e) {
            console.log(e.message);
            return failure({ status: false });
        }
    }
    else {
        const params = {
            TableName: "projects",

            FilterExpression: "contains(#pn, :projectName)",
            ExpressionAttributeValues: {
                ":projectName": data.match
            },


            ExpressionAttributeNames: {
                "#pn": "projectName"
            },
        };
        try {
            const result = await dynamoDbLib.call("scan", params);
            return success(result.Items);
        } catch (e) {
            console.log(e.message);
            return failure({status: false});
        }
    }
}