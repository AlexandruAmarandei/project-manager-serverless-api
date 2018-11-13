import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";
import AWS from "aws-sdk";

export async function main(event, context) {
    const data = JSON.parse(event.body);

    const thisProjectId = data.creatorId + ":::"  + data.projectName;

    const paramsForProjectUpdate = {
        TableName: "projects",

        Key: {
            projectId: thisProjectId,
        },

        UpdateExpression: "SET  #p = list_append(#p, :user)",
        ExpressionAttributeNames: {
            "#p" : "participants"
        },
        ExpressionAttributeValues: {
            ":user": [data.email]
        },

        ReturnValues: "ALL_NEW"
    };
    try {
        const result = await dynamoDbLib.call("update", paramsForProjectUpdate);
    } catch (e) {
        return failure({ status: "Could not add user to project" });
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
                ":projectId": [thisProjectId]
            },
            ReturnValues: "ALL_NEW"
        };

        try {
            const result = await dynamoDbLib.call("update", paramsForUserUpdate);
            //sendEmail(data)
            return success(result);
        } catch (e) {
            console.log(e.messageerror+ " "+ e.message);
            return failure({ status: "Could not add user to project" });
        }

    }
    else {
        const paramsForUserUpdate = {
            TableName: "users",

            Key: {
                userId: data.email,
            },

            UpdateExpression: "SET  projects = list_append(projects, :projectId)",
            ExpressionAttributeValues: {
                ":projectId": [thisProjectId]
            },

            ReturnValues: "ALL_NEW"
        };

        try {
            const result = await dynamoDbLib.call("update", paramsForUserUpdate);
            //sendEmail(data);
            return success(result);
        } catch (e) {
            console.log(e.message);
            return failure({ status: "Could not add user to project" });
        }
    }

}

function sendEmail(data){

    var ses = new AWS.SES({
        region: 'eu-west-1'
    });


    var eParams = {
        Destination: {
            ToAddresses: [data.creatorId]
        },
        Message: {
            Body: {
                Text: {
                    Data: "User:"+ data.email + "added to "+ data.projectName
                }
            },
            Subject: {
                Data: "Someone joined one of your projects!"
            }
        },
        Source: data.email
    };

    var email = ses.sendEmail(eParams, function(err, data){
        if(err) console.log(err);
        else {
            context.succeed(event);
        }
    });
}