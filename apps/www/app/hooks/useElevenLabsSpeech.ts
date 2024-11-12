import { useCallback, useState } from "react";
import { getEnv } from "~/lib/env";

const { AI_URL } = getEnv();

export const useElevenLabsSpeech = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = useCallback(async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL("/text-to-speech", AI_URL);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate speech");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (err) {
      setError("Failed to generate or play speech");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { speak, isLoading, error };
};
