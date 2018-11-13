//inspired from https://serverless-stack.com/#table-of-contents

import AWS from "aws-sdk";

export function call(action, params) {
    const dynamoDb = new AWS.DynamoDB.DocumentClient();

    return dynamoDb[action](params).promise();
}