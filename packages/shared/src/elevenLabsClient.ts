import { ElevenLabsClient } from "elevenlabs";

let elevenlabs: ElevenLabsClient | null = null;

export const getElevenLabsClient = (apiKey: string) => {
  if (!elevenlabs) {
    elevenlabs = new ElevenLabsClient({
      apiKey: apiKey,
    });
  }

  return elevenlabs;
};

export const textToSpeech = async (
  text: string,
  apiKey: string,
  voiceId: string,
) => {
  const client = getElevenLabsClient(apiKey);
  if (!client) {
    throw new Error("ElevenLabs client is not initialized");
  }

  try {
    const audio = await client.generate({
      voice: voiceId,
      text: text,
    });

    return audio;
  } catch (error) {
    console.error("Error calling Eleven Labs API:", error);
    throw error;
  }
};
