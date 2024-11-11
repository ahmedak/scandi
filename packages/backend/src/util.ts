import { Context, APIGatewayProxyEvent } from "aws-lambda";

export namespace Util {
  export function handler(
    lambda: (evt: APIGatewayProxyEvent, context: Context) => Promise<string>
  ) {
    return async function(event: APIGatewayProxyEvent, context: Context) {
      let body: string, statusCode: number;

      try {
        body = await lambda(event, context);
        statusCode = 200;
      } catch (error) {
        statusCode = 500;
        body = JSON.stringify({
          error: error instanceof Error ? error.message : String(error),
        });
      }

      return {
        body,
        statusCode,
      };
    };
  }
}