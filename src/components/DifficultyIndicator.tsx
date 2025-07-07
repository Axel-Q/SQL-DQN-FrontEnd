import React from 'react';
import { DifficultyLevel } from '../utils/difficultyManager';

interface DifficultyIndicatorProps {
  level: DifficultyLevel;
  description: string;
}

const getDifficultyColor = (level: DifficultyLevel): string => {
  switch (level) {
    case 'Easy':
      return 'bg-green-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'Hard':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export const DifficultyIndicator: React.FC<DifficultyIndicatorProps> = ({ level, description }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${getDifficultyColor(level)}`} />
        <span className="text-sm font-medium">{level}</span>
      </div>
      <span className="text-sm text-gray-400">•</span>
      <span className="text-sm text-gray-400">{description}</span>
    </div>
  );
}; 