import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Resource } from "sst";

const Client = new S3Client({});

export function get(key: string) {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: Resource.Bucket.name,
  });

  return Client.send(command);
}

export function put(key: string, body: Buffer, contentType: string) {
  const command = new PutObjectCommand({
    Key: key,
    Bucket: Resource.Bucket.name,
    Body: body,
    ContentType: contentType,
  });

  return Client.send(command);
}

export function getPresignedPUTUrl(key: string) {
  const command = new PutObjectCommand({
    Key: key,
    Bucket: Resource.Bucket.name,
  });

  return getSignedUrl(Client, command);
}

export function getPresignedGETUrl(key: string) {
  const command = new GetObjectCommand({
    Key: key,
    Bucket: Resource.Bucket.name,
  });

  return getSignedUrl(Client, command);
}

export * as S3 from "./s3";
