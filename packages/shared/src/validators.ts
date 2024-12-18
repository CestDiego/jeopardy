import { z } from "zod";

export const STACK_NAMES = [
  "cdn",
  "api",
  "web",
  "ai",
  "ws",
  "electric",
] as const;
export const StackNameSchema = z.enum(STACK_NAMES);
export type StackName = z.infer<typeof StackNameSchema>;
