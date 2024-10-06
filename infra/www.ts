import { api, auth } from "./api";
import { uploadsBucket } from "./cdn";

const web = new sst.aws.Remix("Web", {
  path: "apps/www",
  link: [uploadsBucket, api, auth],
});

export const outputs = {
  web: web.url,
};
