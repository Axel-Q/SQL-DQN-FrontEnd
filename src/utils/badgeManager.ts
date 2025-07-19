import { Badge, UserProgress } from '../types';
import { totalQuestionsAcrossAllThemes } from './questionTotals';

const BADGES: Badge[] = [
  {
    id: 'beginner',
    name: 'SQL Beginner',
    shortDescription: 'Complete 3 questions',
    description: 'You\'ve taken your first steps into the world of SQL! Complete 3 questions to earn this badge.',
    icon: 'star',
    unlocked: false,
    requirement: 3,
    type: 'questions',
    order: 1
  },
  {
    id: 'concept-explorer',
    name: 'Concept Explorer',
    shortDescription: 'Master 3 SQL concepts',
    description: 'You\'ve mastered the basics! Complete 3 different SQL concepts to earn this badge.',
    icon: 'book',
    unlocked: false,
    requirement: 3,
    type: 'concepts',
    order: 2
  },
  {
    id: 'sql-apprentice',
    name: 'SQL Apprentice',
    shortDescription: 'Complete 10 questions',
    description: 'Your SQL journey is progressing well! Complete 10 questions to prove your growing expertise.',
    icon: 'award',
    unlocked: false,
    requirement: 10,
    type: 'questions',
    order: 3
  },
  {
    id: 'concept-master',
    name: 'Concept Master',
    shortDescription: 'Master 5 SQL concepts',
    description: 'You\'re becoming a well-rounded SQL developer! Master 5 different SQL concepts to earn this prestigious badge.',
    icon: 'target',
    unlocked: false,
    requirement: 5,
    type: 'concepts',
    order: 4
  },
  {
    id: 'sql-expert',
    name: 'SQL Expert',
    shortDescription: 'Complete 30 questions',
    description: 'You\'re approaching expert territory! Complete 30 questions to showcase your extensive SQL knowledge.',
    icon: 'medal',
    unlocked: false,
    requirement: 30,
    type: 'questions',
    order: 5
  },
  {
    id: 'sql-master',
    name: 'SQL Master',
    shortDescription: `Complete all ${totalQuestionsAcrossAllThemes} questions`,
    description: `The highest honor! Complete all ${totalQuestionsAcrossAllThemes} questions to prove you're a true SQL master.`,
    icon: 'trophy',
    unlocked: false,
    requirement: totalQuestionsAcrossAllThemes,
    type: 'questions',
    order: 6
  }
];

export const initializeProgress = (): UserProgress => {
  // Always return fresh progress for each session
  return {
    completedConcepts: 0,
    completedQuestions: 0,
    badges: [...BADGES],
    uniqueConcepts: []
  };
};

export const getNextBadge = (progress: UserProgress): Badge | null => {
  const unlockedBadges = progress.badges.filter(badge => !badge.unlocked);
  if (unlockedBadges.length === 0) return null;
  
  return unlockedBadges.reduce((prev, curr) => 
    prev.order < curr.order ? prev : curr
  );
};

export const updateProgress = (
  currentProgress: UserProgress,
  questionCompleted: boolean,
  concept?: string | null
): UserProgress => {
  const newProgress = { 
    ...currentProgress,
    badges: JSON.parse(JSON.stringify(currentProgress.badges)),
    uniqueConcepts: [...currentProgress.uniqueConcepts]
  };
  
  if (questionCompleted) {
    newProgress.completedQuestions++;
  }

  if (concept && !newProgress.uniqueConcepts.includes(concept)) {
    newProgress.uniqueConcepts.push(concept);
    newProgress.completedConcepts = newProgress.uniqueConcepts.length;
  }

  // Update badge status
  newProgress.badges = newProgress.badges.map((badge: Badge) => {
    const newBadge = { ...badge };
    
    if (badge.type === 'questions') {
      newBadge.unlocked = newProgress.completedQuestions >= badge.requirement;
    } else if (badge.type === 'concepts') {
      newBadge.unlocked = newProgress.completedConcepts >= badge.requirement;
    }
    
    return newBadge;
  });

  return newProgress;
}; 