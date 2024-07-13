/// <reference path="./.sst/platform/config.d.ts" />
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
      },
    };
  },
  async run() {
    $transform(sst.aws.Function, (args) => {
      args.runtime = "nodejs20.x";
      args.architecture = "arm64";
    });

    const bucket = new sst.aws.Bucket("Bucket");

    const bedrockPermission = {
      actions: ["bedrock:InvokeModel"],
      resources: ["*"],
    };

    const api = new sst.aws.Function("Api", {
      link: [bucket],
      permissions: [bedrockPermission],
      environment: {
        LANGCHAIN_TRACING_V2: "true",
        LANGCHAIN_PROJECT: `${$app.name}-${$app.stage}`,
      },
      handler: "packages/functions/src/api.handler",
      timeout: "3 minutes",
      url: true,
    });

    const web = new sst.aws.Remix("Web", {
      path: "packages/web",
      link: [bucket, api],
    });

    return {
      api: api.url,
      web: web.url,
    };
  },
});
