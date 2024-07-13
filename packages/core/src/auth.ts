import { OAuthRequestError } from "@lucia-auth/oauth";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { getCookie, setCookie } from "hono/cookie";
import { HTTPException } from "hono/http-exception";
import { generateId } from "lucia";
import { lucia as auth, github_auth } from "#clients/lucia";
import { db } from "#db";
import { userTable } from "#schema";

const app = new Hono();

// Middleware to parse JSON body
app.use("*", async (c, next) => {
  if (c.req.header("Content-Type") === "application/json") {
    c.set("jsonBody", await c.req.json());
  }
  await next();
});

// Local login endpoint
app.post("/login", async (c) => {
  const { username, password } = c.get("jsonBody");

  if (typeof username !== "string" || typeof password !== "string") {
    throw new HTTPException(400, { message: "Invalid input" });
  }

  try {
    const key = await auth.useKey("username", username, password);
    const session = await auth.createSession({
      userId: key.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(c);
    authRequest.setSession(session);

    return c.json({ message: "Logged in successfully" }, 200);
  } catch (e) {
    throw new HTTPException(400, { message: "Invalid username or password" });
  }
});

// Local signup endpoint
app.post("/signup", async (c) => {
  const { username, password } = c.get("jsonBody");

  if (typeof username !== "string" || typeof password !== "string") {
    throw new HTTPException(400, { message: "Invalid input" });
  }

  try {
    const userId = generateId(15);
    await auth.createUser({
      userId,
      key: {
        providerId: "username",
        providerUserId: username,
        password,
      },
      attributes: {
        username,
      },
    });
    const session = await auth.createSession({
      userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(c);
    authRequest.setSession(session);

    return c.json({ message: "User created successfully" }, 201);
  } catch (e) {
    throw new HTTPException(400, { message: "Username already taken" });
  }
});

// GitHub OAuth initiation endpoint
app.get("/auth/github", async (c) => {
  const [url, state] = await github_auth.getAuthorizationUrl();
  setCookie(c, "github_oauth_state", state, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 1000,
    secure: process.env.NODE_ENV === "production",
  });

  return c.redirect(url.toString());
});

// GitHub OAuth callback endpoint
app.get("/auth/github/callback", async (c) => {
  const storedState = getCookie(c, "github_oauth_state");
  const state = c.req.query("state");
  const code = c.req.query("code");

  if (!storedState || !state || storedState !== state || typeof code !== "string") {
    return c.json({ error: "Invalid state" }, 400);
  }

  try {
    const { getExistingUser, githubUser, createUser } =
      await github_auth.validateCallback(code);

    const getUser = async () => {
      const existingUser = await getExistingUser();
      if (existingUser) return existingUser;
      const user = await createUser({
        attributes: {
          name: githubUser.login,
        },
      });
      return user;
    };

    const user = await getUser();
    const session = await auth.createSession({
      userId: user.userId,
      attributes: {},
    });
    const authRequest = auth.handleRequest(c);
    authRequest.setSession(session);

    return c.redirect("/");
  } catch (e) {
    if (e instanceof OAuthRequestError) {
      return c.json({ error: "Invalid code" }, 400);
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
  return c.json({ message: `Hello, ${session.user.username || session.user.name}!` });
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
