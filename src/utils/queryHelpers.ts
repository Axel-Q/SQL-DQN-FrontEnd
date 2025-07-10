import { ThemeType, Queries } from './constants';
import { getGeneratedQuery } from './llmService';

export async function generateQueryForConcept(
  theme: ThemeType | string, 
  concept: string,
  coefficient: number,
  randomChoiceParam?: number
) {
  const safeTheme = theme as ThemeType;
  // Generate random choice if not provided
  const conceptData = Queries[safeTheme]?.[concept];
  if (!conceptData) {
    throw new Error(`Invalid concept: ${concept} for theme: ${theme}`);
  }
  
  const randomChoice = randomChoiceParam ?? Math.floor(
    Math.random() * conceptData.numOptions
  );
  
  // Get input and expected data
  const chosenInput = conceptData.input[randomChoice];
  const chosenExpected = conceptData.expected[randomChoice];
  
  // Generate narrative
  const narrative = await getGeneratedQuery(
    safeTheme,
    concept,
    coefficient,
    chosenInput,
    chosenExpected
  );
  
  return {
    narrative,
    randomChoice,
    expected: chosenExpected,
    input: chosenInput
  };
}