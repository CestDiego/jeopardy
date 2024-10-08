import { api, auth } from "./api";
import { uploadsBucket } from "./cdn";

const web = new sst.aws.Remix("BadBatchWeb", {
  path: "apps/bad-batch",
  domain: "badbatch.marcawasi.com",
  link: [uploadsBucket, api, auth],
});

// new sst.x.DevCommand("BadBatchWebCommand", {
//   dev: {
//     command: "pnpm run dev",
//     directory: "apps/bad-batch",
//     autostart: true,
//   },
// });

export const outputs = {
  BadBatchWeb: web.url,
};
