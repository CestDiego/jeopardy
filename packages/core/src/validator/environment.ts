import {
  type GenericSchema,
  type InferOutput,
  ValiError,
  boolean,
  flatten,
  nullish,
  object,
  parse,
  string,
  transform,
} from "valibot";
// import { DOMAIN_NAME } from "@onde-vamos/shared/constants";
import { logger } from "#logger";

const DOMAIN_NAME = "rukuma.marcawasi.com";

export const CommonEnvSchema = object({
  GOOGLE_CLIENT_ID: string(),
  GOOGLE_CLIENT_SECRET: string(),
  // GOOGLE_MAPS_API_KEY: string(),
  // GOOGLE_MAPS_CUSTOM_ID: string(),
  DATABASE_URL: string(),
  SST_STAGE: string(),
  // GA_TRACKING_ID: string(),
  // POSTHOG_API_KEY: string(),
  // TYPESENSE_SEARCH_API_KEY: string(),
  // TYPESENSE_ADMIN_API_KEY: string(),
  // TYPESENSE_HOST: string(),
  // NEON_API_KEY: string(),
  // ANTHROPIC_API_KEY: string(),
  // LINKEDIN_CLIENT_ID: string(),
  // LINKEDIN_CLIENT_SECRET: string(),
  AUTH_URL: nullish(string(), `https://auth.dev.${DOMAIN_NAME}`),
  API_URL: nullish(string(), `https://api.dev.${DOMAIN_NAME}`),
  SITE_URL: nullish(string(), "http://localhost:5173"),
  DOMAIN_NAME: nullish(string(), DOMAIN_NAME),
  ANALYTICS_URL: nullish(string(), `https://i.dev.${DOMAIN_NAME}`),
  CDN_URL: nullish(string(), `https://cdn.${DOMAIN_NAME}`),
  IS_LOCAL: nullish(string(), "false"),
});

export const WebClientEnvSchema = object({
  ...CommonEnvSchema.entries,
});

export const WebServerEnvSchema = object({
  ...CommonEnvSchema.entries,
});

type InferredEnv<T extends GenericSchema | undefined> = T extends GenericSchema
  ? InferOutput<T>
  : typeof window extends undefined
    ? InferOutput<typeof CommonEnvSchema>
    : InferOutput<typeof WebClientEnvSchema>;

export function useEnv<T extends GenericSchema | undefined = undefined>(
  options: { schema?: T; extraEnv?: Record<string, string> } = {},
): InferredEnv<T> {
  const { schema, extraEnv = {} } = options;
  const isWindowDefined = typeof window !== "undefined";
  const defaultEnvSchema = isWindowDefined ? WebClientEnvSchema : CommonEnvSchema;

  const env = isWindowDefined ? window.ENV : process.env;

  try {
    return parse(schema || defaultEnvSchema, {
      ...env,
      ...extraEnv,
    }) as InferredEnv<T>;
  } catch (err) {
    if (err instanceof ValiError) {
      logger.error("Environment variable validation failed:");
      for (const issue of err.issues) {
        logger.error(`- ${issue.path?.map((p) => p.key).join(".")}: ${issue.message}`);
      }
    } else {
      logger.error(
        "An unexpected error occurred during environment variable validation:",
        err,
      );
    }
    throw err;
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends InferOutput<typeof CommonEnvSchema> {}
  }
  namespace window {
    const ENV: InferOutput<typeof WebServerEnvSchema>;
  }
}
