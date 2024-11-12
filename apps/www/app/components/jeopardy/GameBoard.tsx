import { AnimatePresence, motion } from "framer-motion";
import React, { useRef } from "react";
import type { AnsweredQuestion, Category, Question } from "~/types/jeopardy";

interface GameBoardProps {
  categories: Category[];
  questions: Record<string, Question[]>;
  pointValues: number[];
  onQuestionSelect: (category: string, value: number) => void;
  answeredQuestions: Map<string, AnsweredQuestion>;
  selectedCell: { category: string; value: number } | null;
}

export function GameBoard({
  categories,
  questions,
  pointValues,
  onQuestionSelect,
  answeredQuestions,
  selectedCell,
}: GameBoardProps) {
  const cellRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  return (
    <div className="grid grid-cols-6 gap-4 relative">
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
            const isSelected =
              selectedCell?.category === category.id &&
              selectedCell?.value === value;
            const cellKey = `${category.id}-${value}`;

            return (
              <motion.button
                ref={(el) => el && cellRefs.current.set(cellKey, el)}
                type="button"
                key={cellKey}
                layoutId={cellKey}
                className={`p-4 text-center text-white font-bold rounded ${
                  isAnswered ? "bg-gray-800" : "bg-blue-700 hover:bg-blue-600"
                }`}
                onClick={() =>
                  !isAnswered && onQuestionSelect(category.id, value)
                }
                disabled={isAnswered}
                initial={false}
                animate={{
                  scale: isSelected ? 1.1 : 1,
                  zIndex: isSelected ? 50 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                ${value}
              </motion.button>
            );
          })}
        </React.Fragment>
      ))}

      <AnimatePresence>
        {selectedCell && (
          <motion.div
            layoutId={`${selectedCell.category}-${selectedCell.value}`}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-blue-700 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
            >
              {/* Question content will be rendered by QuestionModal */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
