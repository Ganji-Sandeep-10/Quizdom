import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { QuestionOption } from '../types/quiz';

interface QuestionCardProps {
  questionText: string;
  options: QuestionOption[];
  selectedAnswer: number | null;
  answerSubmitted: boolean;
  correctOptionIndex?: number;
  disabled: boolean;
  onSelect: (index: number) => void;
}

const optionLabels = ['A', 'B', 'C', 'D'];

export const QuestionCard = ({
  questionText,
  options,
  selectedAnswer,
  answerSubmitted,
  correctOptionIndex,
  disabled,
  onSelect,
}: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-center text-foreground leading-tight">
        {questionText}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option, i) => {
          const isSelected = selectedAnswer === i;
          const isCorrect = correctOptionIndex === i;
          const showResult = correctOptionIndex !== undefined;

          let resultClass = '';
          if (showResult) {
            if (isCorrect) {
              resultClass = 'correct';
            } else if (isSelected) {
              resultClass = 'incorrect';
            } else {
              resultClass = 'dimmed';
            }
          }

          return (
            <motion.button
              key={option.id}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              disabled={disabled}
              onClick={() => onSelect(i)}
              className={`quiz-option relative flex items-center justify-between overflow-hidden ${
                isSelected ? 'selected' : ''
              } ${resultClass} ${disabled ? 'cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center">
                <span className="mr-3 font-bold text-lg opacity-70">{optionLabels[i]}.</span>
                <span className="text-left">{option.text}</span>
              </div>
              
              {showResult && isCorrect && (
                <CheckCircle2 className="w-6 h-6 text-white animate-in zoom-in duration-300" />
              )}
              {showResult && isSelected && !isCorrect && (
                <XCircle className="w-6 h-6 text-white animate-in zoom-in duration-300" />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};
