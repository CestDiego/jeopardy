import { ApiError } from "@jeopardy/core/errors";
import { logger } from "@jeopardy/core/logger";
import { textToSpeech } from "@jeopardy/shared/elevenLabsClient";
import { Hono } from "hono";
import { handle, streamHandle } from "hono/aws-lambda";
import { logger as honoLogger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { stream } from "hono/streaming";
import { Resource } from "sst";
import { ZodError } from "zod";

const { ELEVEN_LABS_API_KEY, ELEVEN_LABS_VOICE_ID } = Resource;

const app = new Hono();
app.use(
  honoLogger((message: string, ...rest: string[]) =>
    logger.info(rest, message),
  ),
);
app.use(prettyJSON());

app.onError((error, c) => {
  logger.error(error, "An error occurred");

  if (error instanceof ZodError) {
    return c.json({ error: error.flatten() }, { status: 400 });
  }

  if (error instanceof ApiError) {
    return c.json({ error: error.message }, { status: error.statusCode });
  }

  return c.json({ error: "Internal Server Error" }, { status: 500 });
});

app.get("/test", async (c) => {
  return c.json({ message: "Hello, World!" });
});

app.post("/text-to-speech", async (c) => {
  const { text } = await c.req.json();
  const apiKey = ELEVEN_LABS_API_KEY.value;
  const voiceId = ELEVEN_LABS_VOICE_ID.value;

  if (!apiKey || !voiceId) {
    return c.json(
      { error: "Missing ElevenLabs configuration" },
      { status: 500 },
    );
  }

  try {
    const audio = await textToSpeech(text, apiKey, voiceId);
    return c.body(audio, 200, {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="speech.mp3"',
    });
  } catch (error) {
    logger.error(error, "Error in text-to-speech conversion");
    return c.json(
      { error: "Failed to convert text to speech" },
      { status: 500 },
    );
  }
});

app.get("/stream", (c) => {
  return stream(c, async (stream) => {
    // Write a process to be executed when aborted.
    stream.onAbort(() => {
      console.log("Aborted!");
    });
    // Write a Uint8Array.
    await stream.write(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
    await stream.sleep(1000);

    // Pipe a readable stream.
    await stream.pipe(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("starting..."));
          setTimeout(() => {
            controller.enqueue(new TextEncoder().encode("done"));
            controller.close();
          }, 1000);
        },
      }),
    );
  });
});

export const handler = process.env.SST_LIVE ? handle(app) : streamHandle(app);
