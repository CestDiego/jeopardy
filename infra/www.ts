import { api, auth } from "./api";
import { uploadsBucket } from "./cdn";
import { ai } from "./ai";
import { DomainManager } from "../packages/shared/src/DomainManager";

const domainManager = DomainManager.fromSst($app);

const web = new sst.aws.Remix("Web", {
  path: "apps/www",
  link: [uploadsBucket, api, auth, ai],
  domain: {
    name: domainManager.getDomain("web"),
  },
  environment: {
    AI_URL: ai.url,
    API_URL: api.url,
    AUTH_URL: auth.url,
    ELEVEN_LABS_API_KEY: process.env.ELEVEN_LABS_API_KEY || "",
    ELEVEN_LABS_VOICE_ID:
      process.env.ELEVEN_LABS_VOICE_ID || "uYtP7YTp6um0C03KbkWr", // Kwame for story telling
  },
});

export const outputs = {
  web: web.url,
};
