/// <reference path="./.sst/platform/config.d.ts" />
import * as fs from "node:fs";
export default $config({
  app(input) {
    return {
      name: "jeopardy",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-1",
          profile: process.env.GITHUB_ACTIONS
            ? undefined
            : input.stage === "production"
              ? "onde-vamos-production"
              : "onde-vamos-dev",
        },
        neon: "0.6.3",
      },
    };
  },
  async run() {
    $transform(sst.aws.Function, (args) => {
      args.runtime = "nodejs20.x";
      args.architecture = "arm64";
    });
    new sst.x.DevCommand("GraphQL", {
      dev: {
        command: "pnpm run generate:watch",
        directory: "packages/graphql",
        autostart: true,
      },
    });
    const outputs = {};
    for (const value of fs.readdirSync("./infra/")) {
      const result = await import(`./infra/${value}`);
      if (result.outputs) Object.assign(outputs, result.outputs);
    }
    return outputs;
  },
});
