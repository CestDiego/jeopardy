import { motion } from "framer-motion";
import type { Player, GameState } from "~/types/jeopardy";

interface QuestionModalProps {
  gameState: GameState;
  players: Player[];
  isLoading: boolean;
  isTextToSpeechEnabled: boolean;
  onRepeatQuestion: () => void;
  onSkip: () => void;
  onRevealAnswer: () => void;
  onAnswerResult: (correct: boolean) => void;
  layoutId: string;
}

export function QuestionModal({
  gameState,
  players,
  isLoading,
  isTextToSpeechEnabled,
  onRepeatQuestion,
  onSkip,
  onRevealAnswer,
  onAnswerResult,
  layoutId,
}: QuestionModalProps) {
  const currentPlayer = gameState.selectedQuestion ? players[gameState.currentPlayer] : null;
  const question = gameState.selectedQuestion?.questionData;

  if (!question) return null;

  return (
    <motion.div
      layoutId={layoutId}
      className="fixed inset-0 bg-blue-700 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-4xl mx-4 text-center">
        <div className="text-4xl text-white mb-8 font-bold">
          {question.question}
        </div>

        {gameState.phase === "reading" && (
          <div className="text-2xl text-yellow-300 mb-8">
            Reading question...
          </div>
        )}

        {gameState.isAnswerRevealed && (
          <div className="text-3xl text-white mb-16 font-bold">
            {question.answer}
          </div>
        )}

        {gameState.phase === "buzzing" && (
          <div className="text-2xl text-green-300 mb-8 animate-pulse">
            Buzz now!!!!!
          </div>
        )}

        {gameState.phase === "answering" && currentPlayer && (
          <>
            <div className="text-2xl mb-8">
              <span className="text-white">Answering: </span>
              <span style={{ color: currentPlayer.playerInfo.color }}>
                {currentPlayer.playerInfo.name}
              </span>
            </div>
            <div className="flex justify-center gap-8">
              {!gameState.isAnswerRevealed ? (
                <>
                  <button
                    type="button"
                    onClick={onRevealAnswer}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-green-600 transition-colors"
                  >
                    Reveal Answer
                  </button>
                  <button
                    type="button"
                    onClick={onSkip}
                    className="bg-red-500 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-red-600 transition-colors"
                  >
                    Skip
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onAnswerResult(true)}
                    className="bg-green-500 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-green-600 transition-colors"
                  >
                    Correct
                  </button>
                  <button
                    type="button"
                    onClick={() => onAnswerResult(false)}
                    className="bg-red-500 text-white px-8 py-3 rounded-lg text-xl font-bold hover:bg-red-600 transition-colors"
                  >
                    Incorrect
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
