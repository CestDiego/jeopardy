import { type Logger, pino } from "pino";
import { ZodError } from "zod";

let logger: Logger | Console;

export function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

if (typeof window === "undefined") {
  // Server-side logger
  const initServerLogger = async () => {
    if (process.env.IS_LOCAL === "true") {
      const { default: PinoPretty } = await import("pino-pretty");
      return pino(PinoPretty({ colorize: true }));
    }
    return pino({});
  };

  initServerLogger()
    .then((serverLogger) => {
      logger = serverLogger;
    })
    .catch((error) => {
      console.error("Failed to initialize server logger:", error);
      logger = pino({}); // Fallback to default pino logger
    });
} else {
  // Client-side logger
  logger = console;
}

export { logger };
