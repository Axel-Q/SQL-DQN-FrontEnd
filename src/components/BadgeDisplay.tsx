import React from 'react';
import { Trophy, Star, Target, Award, Medal, Book } from 'lucide-react';
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
    case 'book':
      return <Book className="w-5 h-5" />;
    default:
      return <Trophy className="w-5 h-5" />;
  }
};

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges }) => {
  // Sort badges by order for guided progression
  const sortedBadges = [...badges].sort((a, b) => a.order - b.order);
  
  return (
    <div className="bg-gray-800 rounded-lg p-1">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold flex items-center">
          <Trophy className="w-4 h-4 mr-1.5 text-yellow-500" />
          Achievements
        </h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {sortedBadges.map((badge, index) => {
          const nextBadge = sortedBadges[index - 1];
          const isAvailable = index === 0 || nextBadge?.unlocked;
          
          return (
            <div
              key={badge.id}
              className={`
                relative flex items-center gap-2 px-2 py-1.5 rounded-md border 
                transition-all duration-300 cursor-help
                ${badge.unlocked 
                  ? 'border-green-500 bg-green-500/10' 
                  : isAvailable
                    ? 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                    : 'border-gray-700 bg-gray-800/50 opacity-50'
                }
                group
              `}
            >
              <div className={
                badge.unlocked 
                  ? 'text-green-500' 
                  : isAvailable
                    ? 'text-gray-400'
                    : 'text-gray-600'
              }>
                {getBadgeIcon(badge.icon)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium truncate">{badge.name}</div>
                <div className="text-xs text-gray-400 truncate">{badge.shortDescription}</div>
              </div>

              {/* Progress bar for available badges */}
              {!badge.unlocked && isAvailable && (
                <div className="absolute left-0 bottom-0 w-full h-0.5 bg-gray-700">
                  <div 
                    className="bg-green-500 h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min(
                        100,
                        (badge.type === 'questions' 
                          ? badges[0].requirement 
                          : badges[1].requirement) * 100 / badge.requirement
                      )}%`
                    }}
                  />
                </div>
              )}
              
              {/* Detailed tooltip */}
              <div className="
                absolute left-1/2 top-full mt-2 w-48 p-2 rounded bg-gray-900 
                border border-gray-700 text-xs text-gray-300
                transform -translate-x-1/2
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200
                z-10
              ">
                <div className="text-center">
                  <div className="font-medium mb-1">{badge.name}</div>
                  <div>{badge.description}</div>
                </div>
                {/* Arrow */}
                <div className="
                  absolute left-1/2 top-0 w-2 h-2 bg-gray-900 
                  border-l border-t border-gray-700
                  transform -translate-y-1/2 -translate-x-1/2 rotate-45
                "/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 