import { z } from 'zod';

const EnvSchema = z.object({
  ELEVEN_LABS_API_KEY: z.string(),
  ELEVEN_LABS_VOICE_ID: z.string().default('uYtP7YTp6um0C03KbkWr'), // Kwame for story telling
  AI_URL: z.string(),
  API_URL: z.string(),
  AUTH_URL: z.string(),
});

// Validate and parse the environment variables
declare global {
  interface Window {
    ENV: z.infer<typeof EnvSchema>;
  }
}

export function getEnv(): z.infer<typeof EnvSchema> {
  if (typeof window !== 'undefined' && window.ENV) {
    return window.ENV;
  }
  return EnvSchema.parse(process.env);
}

// Export the type for use in other files
export type Env = z.infer<typeof EnvSchema>;
