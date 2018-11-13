import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context){
    const data = JSON.parse(event.body);
    console.log(data.projectId);
    const params = {
        TableName: "projects",
        Key: {
            projectId: data.projectId,
        },
        UpdateExpression: "SET  #s = :status",
        ExpressionAttributeValues: {
            ":status": data.status
        },
        ExpressionAttributeNames:{
          "#s" : "status"
        },
        ReturnValues: "ALL_NEW"
    };
    try {
        const result = await dynamoDbLib.call("update", params);
        return success({status: true});
    } catch (e) {
        return failure({ status: "Could not change status", errorMsg: e.message });
    }
}