import { uploadsBucket } from "./cdn";

const bedrockPermission = {
  actions: ["bedrock:InvokeModel"],
  resources: ["*"],
};

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

export const outputs = {
  ai: ai.url,
};
