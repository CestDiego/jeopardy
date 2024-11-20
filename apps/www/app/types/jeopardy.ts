export type GameRound = "first" | "double" | "final";

export type Player = {
  name?: string;
  color?: string;
  playerInfo: {
    name: string;
    color: string;
  };
};

export type JeopardyAction =
  | "identify"
  | "gameStarted"
  | "gameReset"
  | "buzz"
  | "playerLeft"
  | "questionReady"
  | "questionSelected"
  | "questionSkipped"
  | "questionAnswered"
  | "answerRevealed"
  | "buzzOpen"
  | "buzzClosed"
  | "buzzAccepted"
  | "buzzRejected";

export interface Question {
  question: string;
  answer: string;
  value: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface SelectedQuestion {
  category: string;
  value: number;
  questionData: Question;
}

export interface AnsweredQuestion {
  playerId: string;
  value: number;
  skipped?: boolean;
  isCorrect: boolean;
}

export interface JeopardyConfig {
  defaultCategories: Record<
    string,
    {
      name: string;
      questions: Question[];
    }
  >;
  textToSpeech?: {
    enabled: boolean;
  };
}

export type GamePhase =
  | "setup"
  | "join"
  | "selection"
  | "reading"
  | "buzzing"
  | "answering"
  | "scoring"
  | "complete";

export type Board = {
  categories: Category[];
  questions: Record<string, Question[]>;
};

export type GameState = {
  phase: GamePhase;
  board: Board;
  currentPlayer: number;
  scores: Record<string, number>;
  selectedQuestion: SelectedQuestion | null;
  answeredQuestions: Map<string, AnsweredQuestion>;
  buzzOrder: string[];
  canBuzz: boolean;
  isAnswerRevealed: boolean;
  questionReadStartTime: number | null;
  buzzWindow: {
    startTime: number | null;
    duration: number;
  };
};
