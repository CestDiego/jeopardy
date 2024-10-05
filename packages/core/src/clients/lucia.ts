import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { GitHub, Google } from "arctic";
import { Lucia } from "lucia";
import { db } from "#db";
import { sessionTable, userTable } from "#schema";
import { useEnv } from "#validator";

export const adapter = new DrizzlePostgreSQLAdapter(
  db,
  sessionTable,
  userTable,
);

const Environment = useEnv();

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      googleId: attributes.google_id,
      username: attributes.username,
    };
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      google_id: number;
      username: string;
    };
  }
}

// FIXME: Need to use the useDomain hook so that we can access the domain generated for auth service before it's deployed
export const google_auth = new Google(
  Environment.GOOGLE_CLIENT_ID,
  Environment.GOOGLE_CLIENT_SECRET,
  "https://wbl72yneifkb2aafrclbgnrxi40vjjeq.lambda-url.us-east-1.on.aws/login/google/callback",
);
