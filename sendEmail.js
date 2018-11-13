import AWS from "aws-sdk";

export async function main(event, context) {

    var ses = new AWS.SES({
        region: 'eu-west-1'
    });

    var eParams = {
        Destination: {
            ToAddresses: ["alexandru.as15@gmail.com"]
        },
        Message: {
            Body: {
                Text: {
                    Data: "Hey! What is up?"
                }
            },
            Subject: {
                Data: "Email Subject!!!"
            }
        },
        Source: "alexandru.as15@gmail.com"
    };

    console.log('===SENDING EMAIL===');
    var email = ses.sendEmail(eParams, function(err, data){
        if(err) console.log(err);
        else {
            console.log("===EMAIL SENT===");
            console.log(data);


            console.log("EMAIL CODE END");
            console.log('EMAIL: ', email);
            context.succeed(event);

        }
    });

}