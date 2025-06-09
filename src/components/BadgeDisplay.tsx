import React from 'react';
import { Trophy, Star, Target, Award, Medal } from 'lucide-react';
import { Badge } from '../types';

interface BadgeDisplayProps {
  badges: Badge[];
}

const getBadgeIcon = (iconName: string) => {
  switch (iconName) {
    case 'trophy':
      return <Trophy className="w-6 h-6" />;
    case 'star':
      return <Star className="w-6 h-6" />;
    case 'target':
      return <Target className="w-6 h-6" />;
    case 'award':
      return <Award className="w-6 h-6" />;
    case 'medal':
      return <Medal className="w-6 h-6" />;
    default:
      return <Trophy className="w-6 h-6" />;
  }
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-xl font-semibold mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
        Achievements
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`
              p-3 rounded-lg border-2 transition-all duration-300
              ${badge.unlocked 
                ? 'border-yellow-500 bg-yellow-500/10' 
                : 'border-gray-700 bg-gray-700/50 opacity-50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={badge.unlocked ? 'text-yellow-500' : 'text-gray-500'}>
                {getBadgeIcon(badge.icon)}
              </div>
              <div>
                <h4 className="font-medium">{badge.name}</h4>
                <p className="text-sm text-gray-400">{badge.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 