import * as dynamoDbLib from "./libs/dynamodb-lib";
import AWS from "aws-sdk";

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
        sendEmail(event.request.userAttributes.email);

        callback(null, event);
    } catch (e) {
        callback(null, event);
    }
}

function sendEmail(emailToPut){

        var ses = new AWS.SES({
            region: 'eu-west-1'
        });

        var eParams = {
            Destination: {
                ToAddresses: ["aas1u16emailserviceuser@gmail.com"]
            },
            Message: {
                Body: {
                    Text: {
                        Data: "A new user was created" + emailToPut
                    }
                },
                Subject: {
                    Data: "New user"
                }
            },
            Source: "aas1u16emailserviceuser@gmail.com"
        };

        var email = ses.sendEmail(eParams, function(err, data){
            if(err) console.log(err);

        });


}