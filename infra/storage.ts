export const bucket = new sst.aws.Bucket("Uploads");

export const table = new sst.aws.Dynamo("Docs", {
  fields: {
    userId: "string",
    docId: "string",
  },
  primaryIndex: { hashKey: "userId", rangeKey: "docId" },
});

bucket.subscribe({
  handler: "./packages/backend/src/extract-document-text.handler",
  link: [bucket, table],
}, {
  events: ["s3:ObjectCreated:*"]
});
