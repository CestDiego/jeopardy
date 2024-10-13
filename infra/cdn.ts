import * as fs from "node:fs";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import { getOriginShieldRegion } from "../packages/shared/src/origin-shield";
import { DomainManager } from "../packages/shared/src/DomainManager";

const domainManager = DomainManager.fromSst($app);

const DOMAIN_NAME = "rukuma.marcawasi.com";

export const uploadsBucket = new sst.aws.Bucket("Uploads", {
  access: "cloudfront",
});
const transformedImageBucket = new sst.aws.Bucket("TransformedImages", {
  access: "cloudfront",
});
// Define imageResizer Lambda function
const imageResizer = new sst.aws.Function("ImageResizer", {
  handler: "packages/functions/src/image-processing/index.handler",
  url: true,
  live: false,
  nodejs: {
    install: ["sharp"],
  },
  memory: "1500 MB",
  logging: {
    retention: "1 day",
  },
  link: [transformedImageBucket, uploadsBucket],
  environment: {
    originalImageBucketName: uploadsBucket.name,
    transformedImageBucketName: transformedImageBucket.name,
    transformedImageCacheTTL: "max-age=31622400",
    maxImageSize: "4700000",
  },
});
//  // CloudFront Function for URL rewrites
const urlRewriteFunction = new aws.cloudfront.Function(
  `${$app.name}-${$app.stage}-CDNUrlRewrite`.slice(0, 64),
  {
    runtime: "cloudfront-js-2.0",
    code: pulumi.interpolate`${fs.readFileSync(
      "packages/functions/src/url-rewrite/index.js",
      "utf8",
    )}`,
  },
);
const responseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy(
  `${$app.name}-${$app.stage}-CDNResponseHeadersPolicy`.slice(0, 64),
  {
    comment: "CDN Response Headers Policy",
    corsConfig: {
      originOverride: false,
      accessControlAllowCredentials: false,
      accessControlAllowMethods: {
        items: ["GET", "HEAD"],
      },
      accessControlAllowHeaders: {
        items: ["*"],
      },
      accessControlAllowOrigins: {
        items: [DOMAIN_NAME, $app.stage === "dev" ? "*" : `dev.${DOMAIN_NAME}`],
      },
    },
  },
);
const cdn = new sst.aws.Cdn("ContentDeliveryNetwork", {
  domain: {
    name: domainManager.getDomain("cdn"),
  },
  origins: [
    {
      originId: "S3Origin",
      domainName: transformedImageBucket.domain,
      originShield: {
        enabled: true,
        originShieldRegion: getOriginShieldRegion("us-east-1"),
      },
      s3OriginConfig: {
        originAccessIdentity: new aws.cloudfront.OriginAccessIdentity(
          `${$app.name}-${$app.stage}-origin-access-identity`,
          {
            comment: `${$app.name}-${$app.stage}-origin-access-identity`.slice(
              0,
              64,
            ),
          },
        ).cloudfrontAccessIdentityPath,
      },
    },
    {
      originId: "LambdaOrigin",
      domainName: imageResizer.url.apply((url) => new URL(url).hostname),
      originShield: {
        enabled: true,
        originShieldRegion: getOriginShieldRegion("us-east-1"),
      },
      customOriginConfig: {
        httpPort: 80,
        httpsPort: 443,
        originProtocolPolicy: "https-only",
        originSslProtocols: ["TLSv1.2"],
      },
    },
  ],
  originGroups: [
    {
      originId: "mainOriginGroup",
      failoverCriteria: {
        statusCodes: [500, 502, 503, 504, 404, 403],
      },
      members: [{ originId: "S3Origin" }, { originId: "LambdaOrigin" }],
    },
  ],
  defaultCacheBehavior: {
    targetOriginId: "mainOriginGroup",
    viewerProtocolPolicy: "redirect-to-https",
    allowedMethods: ["GET", "HEAD", "OPTIONS"],
    cachedMethods: ["GET", "HEAD"],
    cachePolicyId: new aws.cloudfront.CachePolicy(
      `${$app.name}-${$app.stage}-imageDeliveryCachePolicy`,
      {
        defaultTtl: 86400,
        maxTtl: 31536000,
        minTtl: 0,
        parametersInCacheKeyAndForwardedToOrigin: {
          cookiesConfig: {
            cookieBehavior: "none",
          },
          headersConfig: {
            headerBehavior: "none",
          },
          queryStringsConfig: {
            queryStringBehavior: "all",
          },
        },
      },
    ).id,
    responseHeadersPolicyId: responseHeadersPolicy.id,
    compress: true,
    functionAssociations: [
      {
        eventType: "viewer-request",
        functionArn: urlRewriteFunction.arn,
      },
    ],
  },
  transform: {
    distribution: {
      priceClass: "PriceClass_All",
      restrictions: {
        geoRestriction: {
          restrictionType: "none",
        },
      },
    },
  },
});

export const outputs = {
  cdn: cdn.domainUrl || cdn.url,
};
