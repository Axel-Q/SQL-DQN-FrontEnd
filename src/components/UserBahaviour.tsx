import React from 'react';

interface UserBehaviourProps {
  attempts: number;
  hintsUsed: boolean;
  hintText?: string;
  onHintToggle: () => void;
  onCorrectAnswerToggle: () => void;
  showCorrectAnswer: boolean;
}

export const UserBehaviour: React.FC<UserBehaviourProps> = ({
  attempts,
  hintsUsed,
  onHintToggle,
  onCorrectAnswerToggle,
  showCorrectAnswer
}) => {
  return (
    <div>
      <div className="flex items-center gap-6 mt-2">
        <span className="px-3 py-1 rounded bg-gray-700 text-gray-200 text-xs font-semibold shadow-sm border border-gray-600">
          Attempts: {attempts}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 font-medium">Get Hint</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hintsUsed}
              onChange={onHintToggle}
              className="sr-only peer"
            />
            <div className={
              "w-10 h-5 rounded-full transition-colors duration-200 " +
              (hintsUsed ? "bg-blue-600" : "bg-gray-600")
            }>
              <div className={
                "absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 " +
                (hintsUsed ? "translate-x-5" : "")
              }></div>
            </div>
          </label>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-300 font-medium">Get Answer</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={showCorrectAnswer}
              onChange={onCorrectAnswerToggle}
              className="sr-only peer"
            />
            <div className={
              "w-10 h-5 rounded-full transition-colors duration-200 " +
              (showCorrectAnswer ? "bg-green-600" : "bg-gray-600")
            }>
              <div className={
                "absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform duration-200 " +
                (showCorrectAnswer ? "translate-x-5" : "")
              }></div>
            </div>
          </label>
        </div>
      </div>
    
    </div>
  );
};