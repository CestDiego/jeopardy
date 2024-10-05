// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

function handler(event) {
  const request = event.request;
  const originalImagePath = request.uri;
  //  validate, process and normalize the requested operations in query parameters
  const normalizedOperations = {};
  if (request.querystring) {
    for (const [operation] of Object.entries(request.querystring)) {
      switch (operation.toLowerCase()) {
        case "format": {
          const SUPPORTED_FORMATS = [
            "auto",
            "jpeg",
            "webp",
            "avif",
            "png",
            "svg",
            "gif",
          ];
          if (
            request.querystring[operation].value &&
            SUPPORTED_FORMATS.includes(
              request.querystring[operation].value.toLowerCase(),
            )
          ) {
            let format = request.querystring[operation].value.toLowerCase(); // normalize to lowercase
            if (format === "auto") {
              format = "jpeg";
              if (request.headers.accept) {
                if (request.headers.accept.value.includes("avif")) {
                  format = "avif";
                } else if (request.headers.accept.value.includes("webp")) {
                  format = "webp";
                }
              }
            }
            normalizedOperations.format = format;
          }
          break;
        }
        case "width":
          if (request.querystring[operation].value) {
            const width = Number.parseInt(request.querystring[operation].value);
            if (!Number.isNaN(width) && width > 0) {
              // you can protect the Lambda function by setting a max value, e.g. if (width > 4000) width = 4000;
              normalizedOperations.width = width.toString();
            }
          }
          break;
        case "height":
          if (request.querystring[operation].value) {
            const height = Number.parseInt(
              request.querystring[operation].value,
            );
            if (!Number.isNaN(height) && height > 0) {
              // you can protect the Lambda function by setting a max value, e.g. if (height > 4000) height = 4000;
              normalizedOperations.height = height.toString();
            }
          }
          break;
        case "quality":
          if (request.querystring[operation].value) {
            let quality = Number.parseInt(request.querystring[operation].value);
            if (!Number.isNaN(quality) && quality > 0) {
              if (quality > 100) quality = 100;
              normalizedOperations.quality = quality.toString();
            }
          }
          break;
        default:
          break;
      }
    }
    //rewrite the path to normalized version if valid operations are found
    if (Object.keys(normalizedOperations).length > 0) {
      // put them in order
      const normalizedOperationsArray = [];
      if (normalizedOperations.format)
        normalizedOperationsArray.push(`format=${normalizedOperations.format}`);
      if (normalizedOperations.quality)
        normalizedOperationsArray.push(
          `quality=${normalizedOperations.quality}`,
        );
      if (normalizedOperations.width)
        normalizedOperationsArray.push(`width=${normalizedOperations.width}`);
      if (normalizedOperations.height)
        normalizedOperationsArray.push(`height=${normalizedOperations.height}`);
      request.uri = `${originalImagePath}/${normalizedOperationsArray.join(",")}`;
    } else {
      // If no valid operation is found, flag the request with /original path suffix
      request.uri = `${originalImagePath}/original`;
    }
  } else {
    // If no query strings are found, flag the request with /original path suffix
    request.uri = `${originalImagePath}/original`;
  }
  // remove query strings
  request.querystring = {};
  return request;
}
