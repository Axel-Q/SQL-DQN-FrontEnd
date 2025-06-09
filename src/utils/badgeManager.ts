import { Badge, UserProgress } from '../types';

const BADGES: Badge[] = [
  {
    id: 'concept-master-3',
    name: 'Concept Explorer',
    description: 'Mastered 3 SQL concepts',
    icon: 'star',
    unlocked: false
  },
  {
    id: 'question-master-5',
    name: 'SQL Novice',
    description: 'Completed 5 questions',
    icon: 'target',
    unlocked: false
  },
  {
    id: 'question-master-10',
    name: 'SQL Apprentice',
    description: 'Completed 10 questions',
    icon: 'award',
    unlocked: false
  },
  {
    id: 'question-master-30',
    name: 'SQL Expert',
    description: 'Completed 30 questions',
    icon: 'medal',
    unlocked: false
  },
  {
    id: 'question-master-50',
    name: 'SQL Master',
    description: 'Completed 50 questions',
    icon: 'trophy',
    unlocked: false
  }
];

export const initializeProgress = (): UserProgress => {
  return {
    completedConcepts: 0,
    completedQuestions: 0,
    badges: [...BADGES]
  };
};

export const updateProgress = (
  currentProgress: UserProgress,
  conceptCompleted: boolean,
  questionCompleted: boolean
): UserProgress => {
  const newProgress = { ...currentProgress };
  
  if (conceptCompleted) {
    newProgress.completedConcepts++;
  }
  
  if (questionCompleted) {
    newProgress.completedQuestions++;
  }

  // Update badge status
  newProgress.badges = newProgress.badges.map(badge => {
    const newBadge = { ...badge };
    
    switch (badge.id) {
      case 'concept-master-3':
        newBadge.unlocked = newProgress.completedConcepts >= 3;
        break;
      case 'question-master-5':
        newBadge.unlocked = newProgress.completedQuestions >= 5;
        break;
      case 'question-master-10':
        newBadge.unlocked = newProgress.completedQuestions >= 10;
        break;
      case 'question-master-30':
        newBadge.unlocked = newProgress.completedQuestions >= 30;
        break;
      case 'question-master-50':
        newBadge.unlocked = newProgress.completedQuestions >= 50;
        break;
    }
    
    return newBadge;
  });

  return newProgress;
}; 