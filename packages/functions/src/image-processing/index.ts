// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import Sharp, { type FormatEnum } from "sharp";
import { logger } from "../../../shared/src/logger";
import { retry } from "../../../shared/src/utils";
import { Watermark } from "./watermark";

const s3Client = new S3Client({
  maxAttempts: 3,
});

const {
  originalImageBucketName: S3_ORIGINAL_IMAGE_BUCKET,
  transformedImageBucketName: S3_TRANSFORMED_IMAGE_BUCKET,
  transformedImageCacheTTL: TRANSFORMED_IMAGE_CACHE_TTL,
  maxImageSize: MAX_IMAGE_SIZE,
} = process.env;

interface ImageOperations {
  resize?: { width: number };
  format?: keyof FormatEnum;
  quality?: number;
}

export const handler = async (event: APIGatewayProxyEventV2) => {
  try {
    if (!validateRequest(event)) {
      return sendError(400, "Only GET method is supported", event);
    }

    logger.info({ event }, "event");

    const { originalImagePath, operationsPrefix } = parseImagePath(
      event.requestContext.http.path,
    );

    if (originalImagePath === "favicon.ico")
      return sendError(404, "Favicon Doesn't Exist", event);

    const operations = parseImageOperations(operationsPrefix);

    const { originalImageBody, contentType } =
      await downloadOriginalImage(originalImagePath);

    let transformedImage = await processImage(
      originalImageBody,
      operations,
      contentType,
    );

    if (!originalImagePath.includes("avatars")) {
      transformedImage = await applyWatermark(transformedImage, operations);
    }

    const transformedImageBuffer = await transformedImage.toBuffer();

    if (Buffer.byteLength(transformedImageBuffer) > Number(MAX_IMAGE_SIZE)) {
      return handleLargeImage(originalImagePath, operationsPrefix);
    }

    if (S3_TRANSFORMED_IMAGE_BUCKET) {
      logger.info(
        `Uploading transformed image to S3 ${S3_TRANSFORMED_IMAGE_BUCKET}/${originalImagePath}/${operationsPrefix}`,
      );
      await retry(
        async () =>
          await uploadTransformedImage(
            transformedImageBuffer,
            originalImagePath,
            operationsPrefix,
            contentType,
          ),
      );
    }

    return {
      statusCode: 200,
      body: transformedImageBuffer.toString("base64"),
      isBase64Encoded: true,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": TRANSFORMED_IMAGE_CACHE_TTL,
      },
    };
  } catch (error) {
    logger.error(error, "Error processing image");
    return sendError(500, "Error processing image", error);
  }
};

function validateRequest(event: APIGatewayProxyEventV2): boolean {
  return (
    event.requestContext?.http && event.requestContext.http.method === "GET"
  );
}

function parseImagePath(path: string): {
  originalImagePath: string;
  operationsPrefix: string;
} {
  const pathArray = path.split("/");
  const operationsPrefix = pathArray.pop();
  pathArray.shift();
  const originalImagePath = pathArray.join("/");
  return { originalImagePath, operationsPrefix };
}

function parseImageOperations(operationsPrefix: string): ImageOperations {
  const operationsArray = operationsPrefix.split(",");
  const operations: ImageOperations = {
    format: "webp",
    resize: {
      width: 1000,
    },
    quality: 100,
  };

  console.log({ operationsPrefix, operationsArray });

  for (const op of operationsArray) {
    const [key, value] = op.split("=");
    if (key === "width" || key === "height") {
      operations.resize = operations.resize || {};
      operations.resize[key] = Number.parseInt(value);
      console.log({ key, value });
    } else if (key === "format") {
      operations.format = value as keyof FormatEnum;
    } else if (key === "quality") {
      operations.quality = Number.parseInt(value);
    }
  }

  console.log("parsed", { operations });

  return operations;
}

async function downloadOriginalImage(originalImagePath: string) {
  try {
    const getOriginalImageCommand = new GetObjectCommand({
      Bucket: S3_ORIGINAL_IMAGE_BUCKET,
      Key: originalImagePath,
    });
    const { Body, ContentType } = await s3Client.send(getOriginalImageCommand);
    if (!Body || !ContentType) {
      throw new Error(`Error downloading original image ${originalImagePath}`);
    }
    return {
      originalImageBody: await Body.transformToByteArray(),
      contentType: ContentType,
    };
  } catch (error) {
    logger.error(error);
    throw new Error(
      `Error downloading original image ${originalImagePath}`,
      error,
    );
  }
}

async function processImage(
  originalImageBody: Uint8Array,
  operations: ImageOperations,
) {
  let transformedImage = Sharp(originalImageBody, {
    failOn: "none",
    animated: true,
  });
  const metadata = await transformedImage.metadata();

  if (operations.resize) {
    console.log("operations at resize", { operations });
    transformedImage = transformedImage.resize(operations.resize);
  }

  if (metadata.orientation) {
    transformedImage = transformedImage.rotate();
  }

  if (operations.format) {
    const formatOptions = operations.quality
      ? { quality: operations.quality }
      : {};
    transformedImage = transformedImage.toFormat(
      operations.format as keyof FormatEnum,
      formatOptions,
    );
  }

  return transformedImage;
}

async function uploadTransformedImage(
  imageBuffer: Buffer,
  originalImagePath: string,
  operationsPrefix: string,
  contentType: string,
) {
  try {
    const putImageCommand = new PutObjectCommand({
      Body: imageBuffer,
      Bucket: S3_TRANSFORMED_IMAGE_BUCKET,
      Key: `${originalImagePath}/${operationsPrefix}`,
      ContentType: contentType,
      Metadata: { "cache-control": TRANSFORMED_IMAGE_CACHE_TTL },
    });
    const upload = await s3Client.send(putImageCommand);
    if (upload.$metadata.httpStatusCode === 200) {
      logger.info(
        `Uploaded transformed image to S3 ${S3_TRANSFORMED_IMAGE_BUCKET}/${originalImagePath}/${operationsPrefix}`,
      );
    } else {
      logger.warn(
        upload.$metadata,
        `Upload to S3 might have failed for ${S3_TRANSFORMED_IMAGE_BUCKET}/${originalImagePath}/${operationsPrefix}`,
      );
      throw new Error(
        `Upload to S3 might have failed for ${S3_TRANSFORMED_IMAGE_BUCKET}/${originalImagePath}/${operationsPrefix}`,
      );
    }
  } catch (error) {
    logger.error(error, "Could not upload transformed image to S3");
  }
}

function handleLargeImage(originalImagePath: string, operationsPrefix: string) {
  if (S3_TRANSFORMED_IMAGE_BUCKET) {
    return {
      statusCode: 302,
      headers: {
        Location: `/${originalImagePath}?${operationsPrefix.replace(/,/g, "&")}`,
        "Cache-Control": "private,no-store",
      },
    };
  }
  return sendError(403, "Requested transformed image is too big", "");
}

async function applyWatermark(image: Sharp.Sharp, operations: ImageOperations) {
  // TODO: Check if the image should be watermarked
  // Avatars shouldn't be watermarked and they live under /avatars/ path
  const meta = await image.metadata();
  let inputImageSize = meta.width || 0;
  // metadata for the transformed image doesn't change when we transform it :(
  if (operations.resize?.width) {
    inputImageSize = operations.resize.width;
  }

  // Skip watermark for small images
  if (inputImageSize < 200) {
    console.log("Skipping watermarking for too small images");
    return image;
  }
  // For now we are just 1/5th of the image size
  const watermarkSize = Math.floor(inputImageSize * 0.2);
  console.log({ watermarkSize, inputImageSize });

  const watermark = Sharp(Buffer.from(Watermark, "base64")).resize(
    watermarkSize,
    watermarkSize,
    {
      fit: "inside",
    },
  );

  return image
    .composite([
      {
        input: await watermark.toBuffer(),
        gravity: "center",
        blend: "over",
      },
    ])
    .sharpen({ sigma: 1, m1: 1, m2: 1 });
}

function sendError(statusCode: number, body: string, error: unknown) {
  logError(body, error);
  return { statusCode, body };
}

function logError(body: string, error: unknown) {
  console.log("APPLICATION ERROR", body);
  console.log(error);
}
