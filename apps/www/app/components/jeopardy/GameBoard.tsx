import React from 'react';
import type { Category, Question, AnsweredQuestion } from '~/types/jeopardy';

interface GameBoardProps {
  categories: Category[];
  questions: Record<string, Question[]>;
  pointValues: number[];
  onQuestionSelect: (category: string, value: number) => void;
  answeredQuestions: Map<string, AnsweredQuestion>;
}

export function GameBoard({ 
  categories, 
  questions, 
  pointValues, 
  onQuestionSelect, 
  answeredQuestions 
}: GameBoardProps) {
  return (
    <div className="grid grid-cols-6 gap-4">
      {/* Render category headers */}
      {categories.map((category) => (
        <div 
          key={category.id} 
          className="text-center p-4 bg-blue-900 text-white font-bold rounded"
        >
          {category.name}
        </div>
      ))}

      {/* Render questions grid */}
      {[200, 400, 600, 800, 1000].map((value) => (
        <React.Fragment key={value}>
          {categories.map((category) => {
            const isAnswered = answeredQuestions.has(`${category.id}-${value}`);
            
            return (
              <button
                type="button"
                key={`${category.id}-${value}`}
                className={`p-4 text-center text-white font-bold rounded ${
                  isAnswered ? 'bg-gray-800' : 'bg-blue-700 hover:bg-blue-600'
                }`}
                onClick={() => !isAnswered && onQuestionSelect(category.id, value)}
                disabled={isAnswered}
              >
                ${value}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
} 