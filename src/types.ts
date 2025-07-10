export interface Schema {
  name: string;
  columns: string[];
  types: string[];
}

export interface MainUIProps {
  initialOutput: string;
  initialSchemas: Schema[];
  theme: string;
  concepts: string[];
  concept: string;
  randomChoice: number;
}

export type HistoryEntry = {
  userQuery: string;
  dbResultString: string;
};

/** Tracks each task's correctness, name, concept, and narrative. */
export type TaskStatus = {
  taskName: string;
  correct: boolean;
  concept: string;
  narrative: string;
};

export interface Badge {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requirement: number;
  type: 'questions' | 'concepts';
  order: number;
}

export interface UserProgress {
  completedQuestions: number;
  completedConcepts: number;
  badges: Badge[];
  uniqueConcepts: string[];
}