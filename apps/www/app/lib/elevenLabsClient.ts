import { ElevenLabsClient } from 'elevenlabs';
import { getEnv } from './env';

let elevenlabs: ElevenLabsClient | null = null;

export const getElevenLabsClient = () => {
  const env = getEnv();
  
  if (!env.ELEVEN_LABS_API_KEY) {
    console.error('ELEVEN_LABS_API_KEY is not set in the environment variables');
    return null;
  }

  if (!elevenlabs) {
    elevenlabs = new ElevenLabsClient({
      apiKey: env.ELEVEN_LABS_API_KEY,
    });
  }

  return elevenlabs;
};

export const textToSpeech = async (text: string) => {
  const client = getElevenLabsClient();
  if (!client) {
    throw new Error('ElevenLabs client is not initialized');
  }

  try {
    const audio = await client.generate({
      voice: getEnv().ELEVEN_LABS_VOICE_ID,
      text: text,
    });

    return audio;
  } catch (error) {
    console.error("Error calling Eleven Labs API:", error);
    throw error;
  }
};
