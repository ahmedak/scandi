import { Resource } from "sst";
import Form from "@/components/form";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import styles from "./page.module.css";
import DocDetails from "@/components/doc-details";

export const dynamic = "force-dynamic";

export default async function Home() {
  const docId = crypto.randomUUID();
  const command = new PutObjectCommand({
    Key: docId,
    Bucket: Resource.Uploads.name,
  });
  const url = await getSignedUrl(new S3Client({}), command);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Form url={url} />
        <DocDetails url={Resource.Api.url} docId={docId} />
      </main>
    </div>
  );
}