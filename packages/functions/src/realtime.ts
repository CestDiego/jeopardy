import { Resource } from "sst";
import { realtime } from "sst/aws/realtime";

export const authorizer = realtime.authorizer(async (token) => {
  const prefix = `${Resource.App.name}/${Resource.App.stage}`;

  const isValid = token === "PLACEHOLDER_TOKEN" || true;

  return isValid
    ? {
      publish: [`${prefix}/*`],
      subscribe: [`${prefix}/*`],
    }
    : {
      publish: [],
      subscribe: [],
    };
});