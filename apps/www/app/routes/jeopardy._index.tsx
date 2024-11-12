import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import { useState } from "react";
import { BackgroundMusic } from "~/components/jeopardy/BackgroundMusic";
import { CurrentPlayer } from "~/components/jeopardy/CurrentPlayer";
import { GameBoard } from "~/components/jeopardy/GameBoard";
import { GameOverScreen } from "~/components/jeopardy/GameOverScreen";
import { GameSetup } from "~/components/jeopardy/GameSetup";
import { QuestionModal } from "~/components/jeopardy/QuestionModal";
import { Scoreboard } from "~/components/jeopardy/Scoreboard";
import jeopardyConfig from "~/config/jeopardy-config.json";
import { useGameAudio } from "~/hooks/useGameAudio";
import { useJeopardyGame } from "~/hooks/useJeopardyGame";
import type { JeopardyConfig } from "~/types/jeopardy";

const config = jeopardyConfig as unknown as JeopardyConfig;

export default function JeopardyGame() {
  const defaultPlayers = config.gameSettings.players.defaults;
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [categories, setCategories] = useState(
    Object.keys(config.defaultCategories),
  );
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(
    config.textToSpeech?.enabled ?? false,
  );
  const { speak, isLoading } = useElevenLabsSpeech();
  const [selectedCell, setSelectedCell] = useState<{
    category: string;
    value: number;
  } | null>(null);

  const {
    gameState,
    selectQuestion,
    revealAnswer,
    handleAnswer,
    skipQuestion,
    startNewGame,
  } = useJeopardyGame({
    defaultPlayers,
    initialCategories: categories,
    config,
  });

  const { isMusicPlaying } = useGameAudio({
    isSetupPhase,
    hasSelectedQuestion: !!gameState.selectedQuestion,
  });

  const handleStartGame = (customCategories: string[]) => {
    setCategories(customCategories);
    setIsSetupPhase(false);
    startNewGame(customCategories);
  };

  const handleQuestionClick = (category: string, value: number) => {
    setSelectedCell({ category, value });
    selectQuestion(category, value);

    if (isTextToSpeechEnabled) {
      const question = gameState.board.questions[category]?.find(
        (q) => q.value === value,
      );
      if (question) {
        speak(question.question);
      }
    }
  };

  const handleQuestionClose = () => {
    setSelectedCell(null);
  };

  const isGameOver =
    Array.from(gameState.answeredQuestions.values()).length ===
    Object.keys(gameState.board.questions).length * 5;

  const handlePlayAgain = () => {
    setIsSetupPhase(true);
    startNewGame(categories);
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <BackgroundMusic isPlaying={isMusicPlaying} />

      {isSetupPhase ? (
        <GameSetup
          savedGames={[]}
          onStartGame={handleStartGame}
          defaultCategories={categories}
        />
      ) : (
        <>
          <CurrentPlayer
            player={defaultPlayers[gameState.currentPlayer]}
            score={
              gameState.scores[defaultPlayers[gameState.currentPlayer].name]
            }
          />

          <div className="flex gap-8 max-w-[1600px] mx-auto mt-20">
            <div className="flex-grow">
              <GameBoard
                categories={gameState.board.categories}
                questions={gameState.board.questions}
                pointValues={
                  config.gameSettings.rounds[gameState.round].pointValues
                }
                onQuestionSelect={handleQuestionClick}
                answeredQuestions={gameState.answeredQuestions}
                selectedCell={selectedCell}
              />
            </div>
            <div className="w-96">
              <Scoreboard
                players={defaultPlayers}
                scores={gameState.scores}
                currentPlayerIndex={gameState.currentPlayer}
              />
            </div>

            {gameState.selectedQuestion && (
              <QuestionModal
                layoutId={`${selectedCell?.category}-${selectedCell?.value}`}
                question={gameState.selectedQuestion.questionData}
                currentPlayer={defaultPlayers[gameState.currentPlayer]}
                value={gameState.selectedQuestion.value}
                isAnswerRevealed={gameState.isAnswerRevealed}
                showAnswerButtons={gameState.isAnswerRevealed}
                isLoading={isLoading}
                isTextToSpeechEnabled={isTextToSpeechEnabled}
                onRepeatQuestion={() => {
                  if (isTextToSpeechEnabled && gameState.selectedQuestion) {
                    speak(gameState.selectedQuestion.questionData.question);
                  }
                }}
                onSkip={() => {
                  skipQuestion();
                  handleQuestionClose();
                }}
                onRevealAnswer={revealAnswer}
                onAnswerResult={(correct) => {
                  handleAnswer(correct);
                  handleQuestionClose();
                }}
              />
            )}
          </div>

          {isGameOver && (
            <GameOverScreen
              players={defaultPlayers}
              scores={gameState.scores}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </>
      )}
    </div>
  );
}
