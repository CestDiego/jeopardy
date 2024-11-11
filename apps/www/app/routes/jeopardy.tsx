import { useState } from 'react';
import { useElevenLabsSpeech } from "@/hooks/useElevenLabsSpeech";
import type { JeopardyConfig } from '~/types/jeopardy';
import jeopardyConfig from '~/config/jeopardy-config.json';
import { useJeopardyGame } from '~/hooks/useJeopardyGame';
import { useGameAudio } from '~/hooks/useGameAudio';
import { GameBoard } from '~/components/jeopardy/GameBoard';
import { QuestionModal } from '~/components/jeopardy/QuestionModal';
import { GameSetup } from '~/components/jeopardy/GameSetup';
import { Scoreboard } from '~/components/jeopardy/Scoreboard';
import { CurrentPlayer } from '~/components/jeopardy/CurrentPlayer';
import { BackgroundMusic } from '~/components/jeopardy/BackgroundMusic';

const config = jeopardyConfig as unknown as JeopardyConfig;

export default function JeopardyGame() {
  const defaultPlayers = config.gameSettings.players.defaults;
  const [isSetupPhase, setIsSetupPhase] = useState(true);
  const [categories, setCategories] = useState(Object.keys(config.defaultCategories));
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(config.textToSpeech?.enabled ?? false);
  const { speak, isLoading } = useElevenLabsSpeech();

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
    selectQuestion(category, value);
    
    if (isTextToSpeechEnabled) {
      const question = gameState.board.questions[category]?.find(q => q.value === value);
      if (question) {
        speak(question.question);
      }
    }
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
            score={gameState.scores[defaultPlayers[gameState.currentPlayer].name]}
          />

          <div className="flex gap-8 max-w-[1600px] mx-auto mt-20">
            <div className="flex-grow">
              <GameBoard
                categories={gameState.board.categories}
                questions={gameState.board.questions}
                pointValues={config.gameSettings.rounds[gameState.round].pointValues}
                onQuestionSelect={handleQuestionClick}
                answeredQuestions={gameState.answeredQuestions}
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
                onSkip={skipQuestion}
                onRevealAnswer={revealAnswer}
                onAnswerResult={handleAnswer}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}