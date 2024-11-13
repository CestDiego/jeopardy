import { useState } from "react";
import type { AnsweredQuestion, JeopardyConfig, Player, Question } from "~/types/jeopardy";

interface GameState {
  board: {
    categories: { id: string; name: string }[];
    questions: Record<string, Question[]>;
  };
  currentPlayer: number;
  scores: Record<string, number>;
  answeredQuestions: Map<string, AnsweredQuestion>;
  selectedQuestion: {
    category: string;
    value: number;
    questionData: Question;
  } | null;
  isAnswerRevealed: boolean;
  round: "first" | "double" | "final" | "end";
}

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
    board: {
      categories: [],
      questions: {},
    },
    currentPlayer: 0,
    scores: Object.fromEntries(players.map((p) => [p.playerInfo.name, 0])),
    answeredQuestions: new Map(),
    selectedQuestion: null,
    isAnswerRevealed: false,
    round: "first",
  });

  const selectQuestion = (category: string, value: number) => {
    const question = gameState.board.questions[category]?.find(
      (q) => q.value === value,
    );
    if (!question || gameState.answeredQuestions.has(`${category}-${value}`))
      return;

    setGameState((prev) => ({
      ...prev,
      selectedQuestion: {
        category,
        value,
        questionData: question,
      },
      isAnswerRevealed: false,
    }));
  };

  const revealAnswer = () => {
    setGameState((prev) => ({
      ...prev,
      isAnswerRevealed: true,
    }));
  };

  const handleAnswer = (correct: boolean) => {
    if (!gameState.selectedQuestion) return;

    const currentPlayerName =
      players[gameState.currentPlayer].playerInfo.name;
    const pointValue = gameState.selectedQuestion.value;

    setGameState((prev) => ({
      ...prev,
      scores: {
        ...prev.scores,
        [currentPlayerName]:
          prev.scores[currentPlayerName] + (correct ? pointValue : -pointValue),
      },
      answeredQuestions: new Map(prev.answeredQuestions).set(
        `${gameState.selectedQuestion!.category}-${gameState.selectedQuestion!.value}`,
        {
          playerId: currentPlayerName,
          value: pointValue,
          isCorrect: correct,
        },
      ),
      selectedQuestion: null,
      currentPlayer: (prev.currentPlayer + 1) % players.length,
    }));
  };

  const skipQuestion = () => {
    if (!gameState.selectedQuestion) return;

    const currentPlayerName = players[gameState.currentPlayer].playerInfo.name;

    setGameState((prev) => ({
      ...prev,
      answeredQuestions: new Map(prev.answeredQuestions).set(
        `${gameState.selectedQuestion!.category}-${gameState.selectedQuestion!.value}`,
        {
          playerId: currentPlayerName,
          value: gameState.selectedQuestion!.value,
          isCorrect: false,
          skipped: true,
        },
      ),
      selectedQuestion: null,
      currentPlayer: (prev.currentPlayer + 1) % players.length,
    }));
  };

  const startNewGame = (categories: string[]) => {
    const board = generateBoard(categories, config);
    setGameState({
      ...gameState,
      board,
      scores: Object.fromEntries(players.map((p) => [p.playerInfo.name, 0])),
      answeredQuestions: new Map(),
      selectedQuestion: null,
      isAnswerRevealed: false,
      round: "first",
    });
  };

  return {
    gameState,
    selectQuestion,
    revealAnswer,
    handleAnswer,
    skipQuestion,
    startNewGame,
  };
}

function generateBoard(categories: string[], config: any) {
  const selectedCategories = categories.map((categoryId) => ({
    id: categoryId,
    name: config.defaultCategories[categoryId].name,
  }));

  const questions = Object.fromEntries(
    categories.map((categoryId) => [
      categoryId,
      config.defaultCategories[categoryId].questions.map((q: any) => ({
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
