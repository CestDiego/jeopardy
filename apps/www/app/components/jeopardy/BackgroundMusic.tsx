import { useEffect, useRef } from "react";

interface BackgroundMusicProps {
  isPlaying: boolean;
  volume?: number;
}

export const BackgroundMusic = ({
  isPlaying,
  volume = 0.3,
}: BackgroundMusicProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/assets/sounds/jeopardy-theme.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [isPlaying]);

  return null;
};
