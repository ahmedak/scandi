import { Resource } from 'sst';
import { S3Event } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import {
  TextractClient,
  AnalyzeDocumentCommand,
  AnalyzeDocumentCommandInput,
  AnalyzeDocumentCommandOutput,
  BlockType,
  Block,
  EntityType,
} from '@aws-sdk/client-textract';

const textractClient = new TextractClient({});
const dynamoDb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const handler = async (event: S3Event) => {
  const docId = event.Records[0].s3.object.key;
  const extractedData = await extractData(docId);
  const keyValuePairs = formatIntoKeyValuePairs(extractedData);
  const dateOfExpiry = getDateOfExpiry(keyValuePairs);
  const dateOfBirth = getDateOfBirth(keyValuePairs);
  await storeDocumentData(docId, {
    dateOfExpiry,
    dateOfBirth,
    allData: keyValuePairs
  })
  console.log(keyValuePairs);
};

async function extractData(docId: string): Promise<AnalyzeDocumentCommandOutput> {
  console.log(`Extracting data of doc Id: ${docId}`);
  const params: AnalyzeDocumentCommandInput = {
    Document: {
      S3Object: {
        Bucket: Resource.Uploads.name,
        Name: docId,
      },
    },
    FeatureTypes: ['FORMS'],
  };

  return textractClient.send(new AnalyzeDocumentCommand(params));
}

function formatIntoKeyValuePairs(data: AnalyzeDocumentCommandOutput) {
  const blockMap: Record<string, Block> = {};
  const keyMap: Record<string, Block> = {};
  const valueMap: Record<string, Block> = {};
  const extractedData: Record<string, string> = {};

  data.Blocks?.forEach((block) => {
    if (block.Id) {
      blockMap[block.Id] = block;
    }
  });

  data.Blocks?.forEach((block) => {
    if (block.Id && block.BlockType === BlockType.KEY_VALUE_SET) {
      if (block.EntityTypes?.includes(EntityType.KEY)) {
        keyMap[block.Id] = block;
      } else if (block.EntityTypes?.includes(EntityType.VALUE)) {
        valueMap[block.Id] = block;
      }
    }
  });

  Object.keys(keyMap).forEach((keyId) => {
    const keyBlock = keyMap[keyId];
    const keyText = getTextForBlock(keyBlock, data.Blocks);
    const valueId = keyBlock.Relationships?.[0]?.Ids?.[0] as string;
    const valueText = getTextForBlock(valueMap[valueId], data.Blocks);
    extractedData[keyText] = valueText;
  });

  return extractedData;
}

function getTextForBlock(block: Block, blocks: Block[] = []): string {
  const ids = block.Relationships?.filter((rel) => rel.Type === 'CHILD').flatMap((rel) => rel.Ids) ?? [];

  const texts = ids.map((id) => {
    const wordBlock = blocks.find((b) => b.Id === id && b.BlockType === 'WORD');
    return wordBlock?.Text || '';
  });

  return texts.join(' ');
}

async function storeDocumentData(
  docId: string,
  documentData: {
    allData: Record<string, string>;
    dateOfExpiry: string;
    dateOfBirth: string;
  }
) {
  const params: PutCommandInput = {
    TableName: Resource.Docs.name,
    Item: {
      userId: '123',
      docId,
      dateOfExpiry: documentData.dateOfExpiry,
      dateOfBirth: documentData.dateOfBirth,
      allData: documentData.allData,
    },
  };

  try {
    console.log(`Storing data of doc id: ${docId}`);
    await dynamoDb.send(new PutCommand(params));
    console.log(`Data of doc id: ${docId} stored successfully.`);
  } catch (error) {
    console.error(`Error storing document ${docId} data:`, error);
    throw new Error('Failed to store document data');
  }
}

function getDateOfExpiry(extractedData: Record<string, string>) {
  for (const key in extractedData) {
    if (key.toLowerCase().includes("date") && key.toLowerCase().includes("expiry")) {
      return extractedData[key];
    }
  }
  return "";
}

function getDateOfBirth(extractedData: Record<string, string>) {
  for (const key in extractedData) {
    if (key.toLowerCase().includes("date") && key.toLowerCase().includes("birth")) {
      return extractedData[key];
    }
  }
  return "";
}