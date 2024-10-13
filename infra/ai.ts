import { uploadsBucket } from "./cdn";
import { allSecrets } from "./secret";

const bedrockPermission = {
  actions: ["bedrock:InvokeModel"],
  resources: ["*"],
};

export const ai = new sst.aws.Function("AiEndpoint", {
  link: [
    uploadsBucket,
    allSecrets.ELEVEN_LABS_API_KEY,
    allSecrets.ELEVEN_LABS_VOICE_ID,
  ],
  permissions: [bedrockPermission],
  environment: {
    LANGCHAIN_TRACING_V2: "true",
    LANGCHAIN_PROJECT: `${$app.name}-${$app.stage}`,
  },
  handler: "packages/functions/src/api.handler",
  url: true,
  streaming: true,
  timeout: "15 minutes",
  live: false,
});

export const outputs = {
  ai: ai.url,
};
