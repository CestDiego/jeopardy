import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Question, Player } from '~/types/jeopardy';

interface QuestionModalProps {
  currentPlayer: Player;
  question: Question;
  value: number;
  isAnswerRevealed: boolean;
  showAnswerButtons: boolean;
  isLoading: boolean;
  onRepeatQuestion: () => void;
  onSkip: () => void;
  onRevealAnswer: () => void;
  onAnswerResult: (correct: boolean) => void;
  isTextToSpeechEnabled: boolean;
}

export const QuestionModal = ({
  currentPlayer,
  question,
  value,
  isAnswerRevealed,
  showAnswerButtons,
  isLoading,
  onRepeatQuestion,
  onSkip,
  onRevealAnswer,
  onAnswerResult,
  isTextToSpeechEnabled,
}: QuestionModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-[#060CE9] border-4 border-black shadow-2xl">
        <div className="p-8 flex flex-col items-center">
          <div className="text-2xl font-bold mb-4 text-yellow-400 uppercase"
               style={{ fontFamily: 'Swiss911, Arial, sans-serif' }}>
            Current Player: {currentPlayer.name}
          </div>
          <div className="text-4xl font-bold mb-8 text-white text-center leading-tight min-h-[120px] flex items-center"
               style={{ 
                 fontFamily: 'Swiss911, Arial, sans-serif',
                 textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
               }}>
            {question.question}
          </div>
          
          {isAnswerRevealed && (
            <div className="text-3xl text-yellow-400 font-bold mb-8 text-center"
                 style={{ fontFamily: 'Swiss911, Arial, sans-serif' }}>
              {question.answer}
            </div>
          )}
          
          <div className="flex justify-center gap-4 w-full">
            {!isAnswerRevealed ? (
              <>
                {isTextToSpeechEnabled && (
                  <Button
                    onClick={onRepeatQuestion}
                    disabled={isLoading}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                  >
                    Repeat Question
                  </Button>
                )}
                <Button
                  variant="destructive"
                  onClick={onSkip}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Skip (-${value})
                </Button>
                <Button
                  onClick={onRevealAnswer}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Reveal Answer
                </Button>
              </>
            ) : showAnswerButtons ? (
              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  onClick={() => onAnswerResult(false)}
                  className="bg-red-600 hover:bg-red-700 text-xl px-8 py-6"
                >
                  Incorrect (-${value})
                </Button>
                <Button
                  onClick={() => onAnswerResult(true)}
                  className="bg-green-600 hover:bg-green-700 text-xl px-8 py-6"
                >
                  Correct (+${value})
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </div>
  );
}; 