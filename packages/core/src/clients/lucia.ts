import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { github } from "@lucia-auth/oauth/providers";
import { Lucia } from "lucia";
import { db } from "#db";
import { sessionTable, userTable } from "#schema";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export const github_auth = github(auth, {
  clientId: process.env.GITHUB_CLIENT_ID as string,
  clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
  }
}
