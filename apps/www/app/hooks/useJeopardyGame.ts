import { useEffect, useState, useCallback } from "react";
import type { AnsweredQuestion, Board, JeopardyConfig, Player, Question } from "~/types/jeopardy";
import type { GameState } from "~/types/jeopardy";

const READING_TIME = 0;

interface UseJeopardyGameProps {
  players: Player[];
  initialCategories: string[];
  config: JeopardyConfig;
}

export function useJeopardyGame({
  players,
  initialCategories,
  config,
}: UseJeopardyGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    phase: 'selection',
    board: generateBoard(initialCategories, config),
    currentPlayer: 0,
    scores: Object.fromEntries(players.map((p) => [p.playerInfo.name, 0])),
    answeredQuestions: new Map(),
    selectedQuestion: null,
    isAnswerRevealed: false,
    buzzOrder: [],
    canBuzz: false,
    questionReadStartTime: null,
    buzzWindow: {
      startTime: null,
      duration: 10000
    }
  });

  // Timer for question reading and buzzer window
  useEffect(() => {
    if (gameState.phase === 'reading' && gameState.questionReadStartTime) {
      const readingTimer = setTimeout(() => {
        setGameState(prev => ({
          ...prev,
          phase: 'buzzing',
          canBuzz: true,
          buzzWindow: {
            ...prev.buzzWindow,
            startTime: Date.now()
          }
        }));
      }, READING_TIME); // Reading time: 3 seconds

      return () => clearTimeout(readingTimer);
    }
  }, [gameState.phase, gameState.questionReadStartTime]);

  const selectQuestion = useCallback((category: string, value: number) => {
    if (gameState.phase !== 'selection') return;

    const question = gameState.board.questions[category]?.find(
      (q) => q.value === value
    );
    if (!question || gameState.answeredQuestions.has(`${category}-${value}`)) return;

    setGameState((prev) => ({
      ...prev,
      phase: 'reading',
      selectedQuestion: {
        category,
        value,
        questionData: question,
      },
      questionReadStartTime: Date.now(),
      buzzOrder: [],
      canBuzz: false,
      isAnswerRevealed: false,
    }));
  }, [gameState.phase, gameState.board.questions, gameState.answeredQuestions]);

  const handleBuzz = useCallback((playerName: string) => {
    if (!gameState.canBuzz || gameState.phase !== 'buzzing') return false;

    console.log('handleBuzz', playerName);
    setGameState(prev => {
      if (prev.buzzOrder.includes(playerName)) return prev;

      const newBuzzOrder = [...prev.buzzOrder, playerName];
      const playerIndex = players.findIndex(p => p.playerInfo.name === playerName);

      // First buzz - switch to answering phase
      if (newBuzzOrder.length === 1) {
        return {
          ...prev,
          phase: 'answering',
          currentPlayer: playerIndex,
          buzzOrder: newBuzzOrder,
          canBuzz: false
        };
      }

      return {
        ...prev,
        buzzOrder: newBuzzOrder
      };
    });

    return true;
  }, [gameState.canBuzz, gameState.phase, players]);

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!gameState.selectedQuestion) return;

      const currentPlayerName = players[gameState.currentPlayer].playerInfo.name;
      const pointValue = gameState.selectedQuestion.value;
      
      setGameState((prev) => {
        const currentScore = prev.scores[currentPlayerName] || 0; // Default to 0 if undefined
        return {
          ...prev,
          scores: {
            ...prev.scores,
            [currentPlayerName]:
              currentScore + (correct ? pointValue : -pointValue),
          },
          phase: "selection",
          selectedQuestion: null,
          buzzOrder: [],
          canBuzz: false,
          answeredQuestions: new Map(prev.answeredQuestions).set(
            `${gameState.selectedQuestion!.category}-${gameState.selectedQuestion!.value}`,
            {
              playerId: currentPlayerName,
              value: pointValue,
              isCorrect: correct,
            },
          ),
        };
      });
    },
    [gameState.selectedQuestion, players]
  );

  const skipQuestion = useCallback(() => {
    if (!gameState.selectedQuestion) return;

    setGameState((prev) => ({
      ...prev,
      phase: "selection",
      answeredQuestions: new Map(prev.answeredQuestions).set(
        `${gameState.selectedQuestion!.category}-${gameState.selectedQuestion!.value}`,
        {
          playerId: "skipped",
          value: gameState.selectedQuestion!.value,
          isCorrect: false,
          skipped: true,
        },
      ),
      selectedQuestion: null,
      buzzOrder: [],
      canBuzz: false,
    }));
  }, [gameState.selectedQuestion]);

  const startNewGame = useCallback((categories: string[]) => {
    const board = generateBoard(categories, config);
    setGameState((prev) => ({
      ...prev,
      phase: 'selection',
      board,
      currentPlayer: Math.floor(Math.random() * players.length), // Random first player
      scores: Object.fromEntries(players.map((p) => [p.playerInfo.name, 0])), // Reset scores
      answeredQuestions: new Map(),
      selectedQuestion: null,
      isAnswerRevealed: false,
      buzzOrder: [],
      canBuzz: false,
      questionReadStartTime: null,
      buzzWindow: {
        startTime: null,
        duration: 5000
      }
    }));
  }, [players, config]);

  return {
    gameState,
    selectQuestion,
    handleBuzz,
    handleAnswer,
    skipQuestion,
    startNewGame,
    revealAnswer: () => setGameState(prev => ({ ...prev, isAnswerRevealed: true })),
  };
}

function generateBoard(categories: string[], config: JeopardyConfig): Board {
  const selectedCategories = categories.map((categoryId) => ({
    id: categoryId,
    name: config.defaultCategories[categoryId].name,
  }));

  const questions = Object.fromEntries(
    categories.map((categoryId) => [
      categoryId,
      config.defaultCategories[categoryId].questions.map((q) => ({
        ...q,
        category: categoryId,
      })),
    ]),
  );

  return {
    categories: selectedCategories,
    questions,
  };
}
