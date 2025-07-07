import { AllConcepts } from './constants';

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

interface ConceptDifficulty {
  level: DifficultyLevel;
  description: string;
}

const CONCEPT_DIFFICULTIES: Record<string, ConceptDifficulty> = {
  [AllConcepts[0]]: { // basic SELECT and FROM
    level: 'Easy',
    description: 'Basic data retrieval'
  },
  [AllConcepts[1]]: { // basic WHERE clause
    level: 'Easy',
    description: 'Simple filtering'
  },
  [AllConcepts[2]]: { // pattern matching with LIKE
    level: 'Easy',
    description: 'Pattern-based filtering'
  },
  [AllConcepts[3]]: { // handle NULL values
    level: 'Medium',
    description: 'NULL value handling'
  },
  [AllConcepts[4]]: { // ORDER BY clause
    level: 'Easy',
    description: 'Result sorting'
  },
  [AllConcepts[5]]: { // INSERT Statement
    level: 'Medium',
    description: 'Data insertion'
  },
  [AllConcepts[6]]: { // UPDATE Statement
    level: 'Medium',
    description: 'Data modification'
  },
  [AllConcepts[7]]: { // DELETE Statement
    level: 'Medium',
    description: 'Data deletion'
  },
  [AllConcepts[8]]: { // basic GROUP BY and HAVING
    level: 'Hard',
    description: 'Data aggregation'
  },
  [AllConcepts[9]]: { // basic JOIN usage
    level: 'Hard',
    description: 'Table relationships'
  }
};

export const getDifficultyForConcept = (concept: string): ConceptDifficulty => {
  return CONCEPT_DIFFICULTIES[concept] || { level: 'Medium', description: 'Standard challenge' };
}; 