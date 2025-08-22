import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import dotenv from "dotenv";


dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function getSignedPdfUrl(fileKey, expiresIn = 300) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: fileKey,
  });

  const url = await getSignedUrl(s3, command, { expiresIn });
  return url;
}
