import { Resource } from 'sst';
import { S3Event } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
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
  console.log(event);
  const params: AnalyzeDocumentCommandInput = {
    Document: {
      S3Object: {
        Bucket: Resource.Uploads.name,
        Name: docId,
      },
    },
    FeatureTypes: ['FORMS'],
  };

  const response = await textractClient.send(
    new AnalyzeDocumentCommand(params)
  );
  const formattedData = formatData(response);
  console.log(formattedData);
};

function formatData(data: AnalyzeDocumentCommandOutput) {
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
  const ids =
    block.Relationships?.filter((rel) => rel.Type === 'CHILD').flatMap(
      (rel) => rel.Ids
    ) ?? [];

  const texts = ids.map((id) => {
    const wordBlock = blocks.find((b) => b.Id === id && b.BlockType === 'WORD');
    return wordBlock?.Text || '';
  });

  return texts.join(' ');
}
