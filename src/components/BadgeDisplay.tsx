import React, { useEffect } from 'react';
import { Trophy, Star, Target, Award, Medal, Book } from 'lucide-react';
import { Badge } from '../types';

interface BadgeDisplayProps {
  badges: Badge[];
  completedQuestions: number;
  completedConcepts: number;
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

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, completedQuestions, completedConcepts }) => {
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
                          ? completedQuestions 
                          : completedConcepts) * 100 / badge.requirement
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

// BadgePopup: shows a temporary popup when a badge is earned
interface BadgePopupProps {
  badge: Badge;
  onClose: () => void;
}

export const BadgePopup: React.FC<BadgePopupProps> = ({ badge, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 100); // 0.1 second
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none">
      <div className="mt-16 bg-white/80 border border-green-400 rounded-xl shadow-xl px-8 py-6 flex flex-col items-center animate-bounce-in pointer-events-auto backdrop-blur-sm" style={{minWidth: 320}}>
        <div className="text-green-500 mb-2 text-4xl">{getBadgeIcon(badge.icon)}</div>
        <div className="text-lg font-bold text-green-700 mb-1">Congratulations!</div>
        <div className="text-base font-semibold text-gray-800 mb-1">You earned the <span className="text-green-600">{badge.name}</span> badge!</div>
        <div className="text-sm text-gray-500 text-center">{badge.shortDescription}</div>
      </div>
    </div>
  );
}; 