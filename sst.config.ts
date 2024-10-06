/// <reference path="./.sst/platform/config.d.ts" />
import * as fs from "node:fs";
import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import NeonDBUtils from "./packages/core/src/utils/neon.db/utils";
import { getOriginShieldRegion } from "./packages/shared/src/origin-shield";
const DOMAIN_NAME = "rukuma.marcawasi.com";

export default $config({
  app(input) {
    return {
      name: "rukuma",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
          profile: "onde-vamos-dev",
        },
        command: "1.0.1",
        local: "0.1.4",
      },
    };
  },
  async run() {
    const bucket = new sst.aws.Bucket("Bucket");
    const createSecrets = <T extends string>(secrets: T[]) =>
      secrets.reduce<Record<T, sst.Secret>>(
        (acc, secret) => {
          acc[secret] = new sst.Secret(secret);
          return acc;
        },
        {} as Record<T, sst.Secret>,
      );

    $transform(sst.aws.Function, (args) => {
      args.runtime = "nodejs20.x";
      args.architecture = "arm64";
    });

    const secrets = createSecrets(["NEON_API_KEY"]);
    const databaseString = $resolve([secrets.NEON_API_KEY.value]).apply(
      async ([neonApiKey]) => {
        if (!neonApiKey) throw new Error("NEON_API_KEY is required");

        const neonDBUtils = new NeonDBUtils({
          neonApiKey,
          config: {
            roleName: "neondb_owner",
            dbName: "neondb",
            projectName: "Rukuma",
          },
          stage: $app.stage,
        });
        const databaseString = await neonDBUtils.getDatabaseString();
        return { primary: databaseString, replicas: [] };
      },
    );
    const DATABASE_CONNECTIONS = new sst.Linkable("DATABASE_CONNECTIONS", {
      properties: databaseString,
    });

    new command.local.Command("Test", {
      create: "touch diddy.log",
      dir: $asset("packages/core").path,
    });
    // const branch = await getOrCreateBranch()
    // console.log({ branch }, 'Branch from Neon')
    new sst.x.DevCommand("GraphQL", {
      dev: {
        command: "pnpm run generate:watch",
        directory: "packages/graphql",
        autostart: true,
      },
    });
    const uploadsBucket = new sst.aws.Bucket("Uploads", {
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
            items: [
              DOMAIN_NAME,
              $app.stage === "dev" ? "*" : `dev.${DOMAIN_NAME}`,
            ],
          },
        },
      },
    );
    const cdn = new sst.aws.Cdn("ContentDeliveryNetwork", {
      domain: {
        name:
          $app.stage === "production"
            ? `${DOMAIN_NAME}`
            : `cdn.${$app.stage}.${DOMAIN_NAME}`,
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
                comment:
                  `${$app.name}-${$app.stage}-origin-access-identity`.slice(
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
    const bedrockPermission = {
      actions: ["bedrock:InvokeModel"],
      resources: ["*"],
    };
    const api = new sst.aws.Function("Api", {
      link: [uploadsBucket, DATABASE_CONNECTIONS],
      handler: "packages/functions/src/graphql/graphql.handler",
      url: true,
    });
    const ai = new sst.aws.Function("AiEndpoint", {
      link: [uploadsBucket],
      permissions: [bedrockPermission],
      environment: {
        LANGCHAIN_TRACING_V2: "true",
        LANGCHAIN_PROJECT: `${$app.name}-${$app.stage}`,
      },
      handler: "packages/functions/src/api.handler",
      timeout: "3 minutes",
      url: true,
    });
    const auth = new sst.aws.Function("Auth", {
      handler: "packages/functions/src/auth.handler",
      url: true,
    });
    const web = new sst.aws.Remix("Web", {
      path: "apps/www",
      link: [uploadsBucket, api, auth],
    });
    return {
      api: api.url,
      auth: auth.url,
      ai: ai.url,
      web: web.url,
      cdn: cdn.domainUrl || cdn.url,
    };
  },
});
