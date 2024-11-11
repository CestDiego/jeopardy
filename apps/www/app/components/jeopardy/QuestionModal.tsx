import { motion } from 'framer-motion';
import type { Question, Player } from '~/types/jeopardy';

interface QuestionModalProps {
  question: Question;
  currentPlayer: Player;
  value: number;
  isAnswerRevealed: boolean;
  showAnswerButtons: boolean;
  isLoading: boolean;
  isTextToSpeechEnabled: boolean;
  onRepeatQuestion: () => void;
  onSkip: () => void;
  onRevealAnswer: () => void;
  onAnswerResult: (correct: boolean) => void;
  layoutId: string;
}

export function QuestionModal({
  question,
  currentPlayer,
  value,
  isAnswerRevealed,
  showAnswerButtons,
  isLoading,
  isTextToSpeechEnabled,
  onRepeatQuestion,
  onSkip,
  onRevealAnswer,
  onAnswerResult,
  layoutId
}: QuestionModalProps) {
  return (
    <motion.div
      layoutId={layoutId}
      className="fixed inset-0 bg-blue-700 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="w-full max-w-4xl mx-4 text-center">
        <div className="text-4xl text-white mb-16 font-bold">
          {question.question}
        </div>

        {isAnswerRevealed && (
          <div className="text-3xl text-white mb-16 font-bold">
            {question.answer}
          </div>
        )}

        <div className="flex justify-center gap-8">
          {!isAnswerRevealed ? (
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
      </div>
    </motion.div>
  );
} 