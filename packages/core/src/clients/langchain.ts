// Contains the prompt generation logic for various models.
import { BedrockChat } from "@langchain/community/chat_models/bedrock";
import type { MessageContent } from "@langchain/core/messages";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Region to use for Bedrock, which differs from the default region (ca-central-1)
// since Bedrock isn't available in all regions yet.
const BEDROCK_REGION = "us-east-1";

const BASE_MODELS = {
  ClaudeHaiku: "anthropic.claude-3-haiku-20240307-v1:0",
  ClaudeSonnet: "anthropic.claude-3-5-sonnet-20240620-v1:0",
} as const;

export const HAIKU = {
  region: BEDROCK_REGION,
  model: BASE_MODELS.ClaudeHaiku,
  maxTokens: 4096,
  verbose: false,
  temperature: 0,
};

export const SONNET = {
  region: BEDROCK_REGION,
  model: BASE_MODELS.ClaudeSonnet,
  maxTokens: 4096,
  verbose: false,
  temperature: 0,
};

type ModelInput = ConstructorParameters<typeof BedrockChat>[0];

/**
 * Creates a LangChain model instance for interacting with the Bedrock AI service.
 *
 * @param input - The input configuration for the model.
 * @returns A LangChain model instance.
 *
 * @description
 * This function creates an instance of the BedrockChat model from the LangChain library.
 * The BedrockChat model is a wrapper around the Bedrock AI service, which allows for
 * natural language processing and generation. The input parameter specifies the
 * configuration for the model, including the region, model name, maximum tokens,
 * verbosity, and temperature.
 */
export function createModel(input: ModelInput) {
  return new BedrockChat(input);
}

function interpolateInput(prompt: string, input: Record<string, unknown>): string {
  const keys = Object.keys(input);
  const regex = new RegExp(`\\{(${keys.join("|")})\\}`, "g");

  return prompt.replace(regex, (match, key) => {
    const value = input[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Creates a LangChain message instance for sending to the Bedrock AI service.
 *
 * @param prompt - The text prompt to be sent to the model.
 * @param imageUrls - An array of image URLs to be included in the message (optional).
 * @returns A LangChain message instance.
 *
 * @description
 * This function creates an instance of the HumanMessage class from the LangChain library.
 * The HumanMessage represents the input message to be sent to the Bedrock AI service.
 * The message content can include both text and image URLs. The prompt parameter is the
 * text prompt to be sent, and the imageUrls parameter is an optional array of image URLs
 * to be included in the message.
 */

type PromptInput = {
  system?: string;
  prompt: string;
  input?: Record<string, unknown>;
  imageUrls?: string[];
};

export function createPrompt({
  system,
  prompt,
  input = {},
  imageUrls = [],
}: PromptInput) {
  const content: MessageContent = [];

  for (const imageUrl of imageUrls) {
    content.push({ type: "image_url", image_url: imageUrl });
  }

  content.push({ type: "text", text: interpolateInput(prompt, input) });

  const userMessage = new HumanMessage({ content });

  return ChatPromptTemplate.fromMessages(
    system
      ? [
          new SystemMessage({ content: system }),
          userMessage,
          new AIMessage({ content: "{" }),
        ]
      : [userMessage, new AIMessage({ content: "{" })],
  );
}

export function createOutputParser() {
  return new StringOutputParser();
}

export * as LangChain from "./langchain";
