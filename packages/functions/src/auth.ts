import { lucia as auth, google_auth } from "@jeopardy/core/clients/lucia";
import {
  OAuth2RequestError,
  generateCodeVerifier,
  generateState,
} from "arctic";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { generateId } from "lucia";
import { serializeCookie } from "oslo/cookie";
import { db } from "#db";
import { userTable } from "#schema";

const app = new Hono();

app.use(logger());

// Middleware to parse JSON body
app.use("*", async (c, next) => {
  if (c.req.header("Content-Type") === "application/json") {
    c.set("jsonBody", await c.req.json());
  }
  await next();
});

// GitHub OAuth initiation endpoint
app.get("/login/google", async (c) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = await google_auth.createAuthorizationURL(state, codeVerifier, {
    scopes: ["openid", "profile", "email"],
  });
  setCookie(c, "google_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === "production",
  });

  // store code verifier as cookie
  setCookie(c, "google_code_verifier", codeVerifier, {
    secure: process.env.NODE_ENV === "production",
    path: "/",
    httpOnly: true,
    maxAge: 60 * 10, // 10 min
  });

  return c.redirect(url.toString());
});

// Google OAuth callback endpoint
app.get("/login/google/callback", async (c) => {
  const state = c.req.query("state");
  const code = c.req.query("code");

  const storedState = getCookie(c, "google_oauth_state");
  const storedCodeVerifier = getCookie(c, "google_code_verifier");

  if (
    !storedState ||
    !storedCodeVerifier ||
    !state ||
    storedState !== state ||
    typeof code !== "string"
  ) {
    return c.json({ error: "Invalid state" }, 400);
  }

  try {
    const tokens = await google_auth.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    );
    console.log({ tokens });

    // const getUser = async () => {
    //   const existingUser = await getExistingUser();
    //   if (existingUser) return existingUser;
    //   const user = await createUser({
    //     attributes: {
    //       name: githubUser.login,
    //     },
    //   });
    //   return user;
    // };

    // const user = await getUser();
    // const session = await auth.createSession({
    //   userId: user.userId,
    //   attributes: {},
    // });
    // const authRequest = auth.handleRequest(c);
    // authRequest.setSession(session);

    return c.redirect("/");
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      const { request, message, description } = e;
      logger("OAuth2RequestError", request, message, description);
      return c.json(e, 400);
    }
    return c.json({ error: "Server error" }, 500);
  }
});

// Logout endpoint
app.post("/logout", async (c) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  await auth.invalidateSession(session.sessionId);
  authRequest.setSession(null);
  return c.json({ message: "Logged out successfully" }, 200);
});

// Protected endpoint example
app.get("/me", async (c) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  const user = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.userId))
    .get();
  return c.json({ user });
});

// Session validation middleware
const validateSession = async (c, next) => {
  const authRequest = auth.handleRequest(c);
  const session = await authRequest.validate();
  if (!session) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  c.set("session", session);
  await next();
};

// Example of using session validation middleware
app.get("/protected", validateSession, (c) => {
  const session = c.get("session");
  return c.json({
    message: `Hello, ${session.user.username || session.user.name}!`,
  });
});

// Error handling
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

// Cleanup expired sessions (this could be run periodically)
app.get("/cleanup", async (c) => {
  await auth.deleteExpiredSessions();
  return c.json({ message: "Expired sessions cleaned up" });
});

export const handler = handle(app);
