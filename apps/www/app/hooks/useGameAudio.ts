import { useEffect, useState } from "react";

interface UseGameAudioProps {
  isSetupPhase: boolean;
  hasSelectedQuestion: boolean;
}

export function useGameAudio({
  isSetupPhase,
  hasSelectedQuestion,
}: UseGameAudioProps) {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    if (!isSetupPhase) {
      setIsMusicPlaying(true);
    }
    return () => setIsMusicPlaying(false);
  }, [isSetupPhase]);

  useEffect(() => {
    if (hasSelectedQuestion) {
      setIsMusicPlaying(false);
    } else if (!isSetupPhase) {
      setIsMusicPlaying(true);
    }
  }, [hasSelectedQuestion, isSetupPhase]);

  return { isMusicPlaying };
}
