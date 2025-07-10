import { Queries } from './constants';

/**
 * Calculates the total number of questions available across all themes.
 * It iterates through each theme and sums the number of question options for each concept.
 */
export const totalQuestionsAcrossAllThemes = Object.values(Queries).reduce(
  (themeSum, themeData) =>
    themeSum +
    Object.values(themeData).reduce(
      (conceptSum, conceptData) => conceptSum + (conceptData.numOptions || 0),
      0
    ),
  0
); 