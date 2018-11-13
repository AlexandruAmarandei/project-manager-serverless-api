import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context) {
    const queryData = event.queryStringParameters;
    const params = {
        TableName: "users",
        FilterExpression: "NOT contains(#p, :projectId)",
        ExpressionAttributeValues: {
            ":projectId" : queryData.creator + ":::"+ queryData.project
        },
        ExpressionAttributeNames: {
            "#p" : "projects"
        },
        ProjectionExpression: "userId, skills"
    };

    try {
        const result = await dynamoDbLib.call("scan", params);
        const parsedResp = result.Items;
        var returnList = [];
        var rlc = 0;
        console.log(parsedResp);
        let j,i;

        for(i =0; i<parsedResp.length;i++){
            for(j = 0; j < parsedResp[i].skills.length;j++) {
                var skill = "";
                skill = parsedResp[i].skills[j];
                if (skill.startsWith(queryData.email)) {
                    returnList[rlc] = parsedResp[i];
                    rlc++;
                }
            }
        }

        return success(returnList);
    } catch (e) {
        console.log(e.message);
        return failure({ status: false });
    }
}