import { Resource } from "sst";
import { Util } from "./util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const main = Util.handler(async (event) => {
  const params = {
    TableName: Resource.Docs.name,
    Key: {
      userId: "123", 
      docId: event?.pathParameters?.id, 
    },
  };

  const result = await dynamoDb.send(new GetCommand(params));
  if (!result.Item) {
    throw new Error("Item not found.");
  }
  console.log(result.Item);
  return JSON.stringify(result.Item);
});