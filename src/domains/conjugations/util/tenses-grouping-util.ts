import type { Tense } from '../resources/conjugations-api';

/**
 * Groups tenses by the first word in their name
 */
export const groupedTenses = (tenses: Tense[]) => {
  const acc = new Map<string, Tense[]>();
  tenses.forEach(tense => {
    const firstWord = tense.name.split(' ')[0];
    if (!acc.has(firstWord)) {
      acc.set(firstWord, []);
    }
    acc.get(firstWord)?.push(tense);
  });
  return acc;
};
