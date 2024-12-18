import { uploadsBucket } from "./cdn";

// export const auth = new sst.aws.Function("Auth", {
//   handler: "packages/functions/src/auth.handler",
//   url: true,
// });

export const api = new sst.aws.Function("Api", {
  link: [uploadsBucket],
  handler: "packages/functions/src/graphql/graphql.handler",
  url: true,
});

export const outputs = {
  // auth: auth.url,
  api: api.url,
};
