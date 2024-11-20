import { useEffect, useCallback } from 'react';
import type { GamePhase } from '~/types/jeopardy';

export function useBuzzerTimer(
  gamePhase: GamePhase,
  onBuzzerOpen: () => void,
  onBuzzerClose: () => void,
  readingDelay = 3000,
  buzzerWindow = 5000
) {
  useEffect(() => {
    if (gamePhase === 'reading') {
      const readingTimer = setTimeout(() => {
        onBuzzerOpen();
      }, readingDelay);

      return () => clearTimeout(readingTimer);
    }

    if (gamePhase === 'buzzing') {
      const buzzerTimer = setTimeout(() => {
        onBuzzerClose();
      }, buzzerWindow);

      return () => clearTimeout(buzzerTimer);
    }
  }, [gamePhase, onBuzzerOpen, onBuzzerClose, readingDelay, buzzerWindow]);
} 