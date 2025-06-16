import React from 'react';
import { Trophy, Star, Target, Award, Medal } from 'lucide-react';
import { Badge } from '../types';

interface BadgeDisplayProps {
  badges: Badge[];
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'trophy':
      return <Trophy className="w-5 h-5" />;
    case 'star':
      return <Star className="w-5 h-5" />;
    case 'target':
      return <Target className="w-5 h-5" />;
    case 'award':
      return <Award className="w-5 h-5" />;
    case 'medal':
      return <Medal className="w-5 h-5" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-2">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-300 whitespace-nowrap
            ${badge.unlocked 
              ? 'border-yellow-500 bg-yellow-500/10' 
              : 'border-gray-700 bg-gray-700/50 opacity-50'
            }
          `}
          title={badge.description}
        >
          <div className={badge.unlocked ? 'text-yellow-500' : 'text-gray-500'}>
            {getBadgeIcon(badge.icon)}
          </div>
          <span className="text-sm font-medium">{badge.name}</span>
        </div>
      ))}
    </div>
  );
}; 