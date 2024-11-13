export type GameRound = "first" | "double" | "final";

export type Player = {
  name?: string;
  color?: string;
  playerInfo: {
    name: string;   
    color: string;
  };
}

export type JeopardyAction = "identify" | "buzz" | "playerLeft";

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
  gameSettings: {
    players: {
      defaults: Player[];
    };
    rounds: Record<
      GameRound,
      {
        pointValues: number[];
      }
    >;
  };
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
