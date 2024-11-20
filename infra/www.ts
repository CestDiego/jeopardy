import { DomainManager } from "../packages/shared/src/DomainManager";
import { ai } from "./ai";
import { api } from "./api";
import { vpc } from "./vpc";
import { cluster, electric } from "./electric-db";
import { uploadsBucket } from "./cdn";

const domainManager = DomainManager.fromSst($app);

const realtime = new sst.aws.Realtime("Realtime", {
  authorizer: "./packages/functions/src/realtime.authorizer",
});

const web = new sst.aws.Remix("Web", {
  path: "apps/www",
  link: [uploadsBucket, api, ai, realtime, cluster, electric],
  domain: {
    name: domainManager.getDomain("web"),
  },
  environment: {
    AI_URL: ai.url,
    API_URL: api.url,
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY || "",
    VITE_REALTIME_URL: realtime.endpoint,
    VITE_REALTIME_AUTHORIZER: realtime.authorizer,
    VITE_APP_NAME: $app.name,
    VITE_APP_STAGE: $app.stage,
    ELEVEN_LABS_VOICE_ID:
      process.env.ELEVEN_LABS_VOICE_ID || "uYtP7YTp6um0C03KbkWr", // Kwame for story telling
  },
});

export const outputs = {
  web: web.url,
  realtimeUrl: realtime.endpoint,
  realtimeAuthorizer: realtime.authorizer,

};
