import { getOriginShieldRegion } from "@onde-vamos/shared/origin-shield";
import { Stacks, useEnv } from "@onde-vamos/shared/types";
import { getCustomDomain, isDevOrProd } from "@onde-vamos/shared/utils";
import {
  Duration,
  Fn,
  RemovalPolicy,
  aws_certificatemanager as acm,
  aws_cloudfront as cf,
  aws_cloudfront_origins as cfOrigins,
  aws_iam as iam,
  aws_route53 as route53,
  aws_route53_targets as route53Targets,
} from "aws-cdk-lib";
import { CfnDistribution, DistributionProps } from "aws-cdk-lib/aws-cloudfront";
import {
  FunctionUrlOrigin,
  HttpOrigin,
  OriginGroup,
  S3Origin,
} from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  Bucket,
  Function as SSTFunction,
  type StackContext,
  use,
} from "sst/constructs";
import { Domain } from "./Domain";
import { Storage } from "./Storage";

/**
 * Create Cloudfront Distribution for the s3 Storage bucket
 **/
export function CDN({ stack, app }: StackContext) {
  const { ENABLE_LOCAL_CDN } = useEnv({});

  // Only Prod and dev stages should get a CDN (to test)
  if (ENABLE_LOCAL_CDN === "false" && !isDevOrProd(stack.stage)) {
    stack.addOutputs({
      CDN: "Usin dev stage CDN. Local CDN is disabled, enable with ENABLE_LOCAL_CDN=true.",
      TRANSFORMED_IMAGES_BUCKET: "CDN is disabled",
    });
    return;
  }

  const zone = use(Domain);
  const bucket = use(Storage);

  const cdnSubdomain = getCustomDomain({
    stage: stack.stage,
    stackName: Stacks.cdn,
  });

  const cdnCertificate = new acm.Certificate(
    stack,
    `cdnCertificate-${stack.stage}`,
    {
      domainName: cdnSubdomain,
      validation: acm.CertificateValidation.fromDns(zone),
    },
  );

  const DevSiteUrl = `https://${getCustomDomain({
    stage: "dev",
    stackName: Stacks.web,
  })}`;
  const ProdSiteUrl = `https://${getCustomDomain({
    stage: "prod",
    stackName: Stacks.web,
  })}`;

  // Code Starts
  // We re-use the dev bucket when ENABLE_LOCAL_CDN is set to true
  const transformedImageBucket = new Bucket(stack, "transformed_images", {
    cdk: {
      bucket: isDevOrProd(stack.stage)
        ? {
            // Images are auto generated when asked so we don't need to keep them
            autoDeleteObjects: true,
            removalPolicy: RemovalPolicy.DESTROY,
            lifecycleRules: [
              {
                expiration: Duration.days(90),
              },
            ],
          }
        : s3.Bucket.fromBucketArn(
            stack,
            "IBucket",
            "arn:aws:s3:::dev-onde-vamos-cdn-transformedimagesbucket8faa450c-ijdptlp5jneb",
          ),
    },
  });

  // Define imageResizer and add permissions
  // This lambda uses sharp and we are loading it everytime without doing any fancy layer upload
  const imageResizer = new SSTFunction(stack, `imageResizer-${stack.stage}`, {
    handler: "packages/functions/src/image-processing/index.handler",
    timeout: "10 seconds",
    memorySize: 1500,
    logRetention: "one_day",
    url: true,
    environment: {
      originalImageBucketName: bucket.bucketName,
      transformedImageBucketName: transformedImageBucket.bucketName,
      transformedImageCacheTTL: "max-age=31622400",
      maxImageSize: "4700000",
    },
  });
  imageResizer.attachPermissions([bucket, transformedImageBucket]);

  if (imageResizer.url === undefined) {
    throw new Error("imageResizer.url is not defined");
  }

  const imageOrigin = new OriginGroup({
    primaryOrigin: new S3Origin(transformedImageBucket.cdk.bucket, {
      originShieldRegion: getOriginShieldRegion("us-east-1"),
    }),
    fallbackOrigin: new HttpOrigin(Fn.parseDomainName(imageResizer.url), {
      originShieldRegion: getOriginShieldRegion("us-east-1"),
    }),
    fallbackStatusCodes: [403, 500, 503, 504],
  });

  // CloudFront Function for url rewrites
  const urlRewriteFunction = new cf.Function(
    stack,
    `urlRewriteFunction-${stack.stage}`,
    {
      code: cf.FunctionCode.fromFile({
        filePath: "packages/functions/src/url-rewrite/index.js",
      }),
    },
  );

  const cdnResponseHeadersPolicy = new cf.ResponseHeadersPolicy(
    stack,
    `cdnResponseHeadersPolicy-${stack.stage}`,
    {
      comment: "Onde CDN Response Headers Policy",
      responseHeadersPolicyName: `OndeCDNResponseHeadersPolicy-${stack.stage}`,
      corsBehavior: {
        originOverride: false,
        accessControlAllowCredentials: false,
        accessControlAllowMethods: ["GET", "HEAD"],
        accessControlAllowHeaders: ["*"],
        accessControlAllowOrigins: [
          ProdSiteUrl,
          // If we are in dev, allow all origins, if we are in prod,
          // allow the dev urls as well, since we want to be able to
          // show prod images in dev sites
          stack.stage === "dev" ? "*" : DevSiteUrl,
        ],
      },
      // recognizing image requests that were processed by this solution
      customHeadersBehavior: {
        customHeaders: [
          { header: "x-aws-image-optimization", value: "v1.0", override: true },
          { header: "vary", value: "accept", override: true },
        ],
      },
    },
  );

  const imageDeliveryCacheBehavior = {
    origin: imageOrigin,
    viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    responseHeadersPolicy: cdnResponseHeadersPolicy,
    allowedMethods: cf.AllowedMethods.ALLOW_GET_HEAD,
    cachePolicy: new cf.CachePolicy(
      stack,
      `imageDeliveryCachePolicy-${stack.stage}`,
      {
        defaultTtl: Duration.hours(24),
        maxTtl: Duration.days(365),
        minTtl: Duration.seconds(0),
        queryStringBehavior: cf.CacheQueryStringBehavior.all(),
      },
    ),
    functionAssociations: [
      {
        eventType: cf.FunctionEventType.VIEWER_REQUEST,
        function: urlRewriteFunction,
      },
    ],
  } satisfies cf.BehaviorOptions;

  const cdn = new cf.Distribution(stack, `cdnDistribution-${stack.stage}`, {
    domainNames: [cdnSubdomain],
    certificate: cdnCertificate,
    defaultBehavior: imageDeliveryCacheBehavior,
    priceClass: cf.PriceClass.PRICE_CLASS_ALL,
  });

  // Assign the CDN distribution to our domain under cdn. subdomain
  const recordProps = {
    recordName: cdnSubdomain,
    zone,
    target: route53.RecordTarget.fromAlias(
      new route53Targets.CloudFrontTarget(cdn),
    ),
  };

  new route53.ARecord(stack, `CdnAliasRecord-${stack.stage}`, recordProps);
  new route53.AaaaRecord(
    stack,
    `CdnAliasRecordAAAA-${stack.stage}`,
    recordProps,
  );

  stack.addOutputs({
    ContentDeliveryNetworkUrl: cdnSubdomain,
    TransformedImageBucketName: transformedImageBucket.bucketName,
    TransformedImageBucketArn: transformedImageBucket.bucketArn,
  });

  return cdn;
}
