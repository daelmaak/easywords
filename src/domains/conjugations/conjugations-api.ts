import { ConjugationsByTense } from './conjugation';

export async function fetchConjugationsByTense(
  verb: string
): Promise<ConjugationsByTense> {
  const res = await fetch(
    `https://daelmaak.pythonanywhere.com/api/conjugations?verb=${verb}`
  );

  const conjugations = (await res.json()) as [string, string, string, string][];

  const conjugationsByTense = conjugations.reduce((acc, conj) => {
    const [mood, tense, person, conjugatedVerb] = conj;

    if (mood === 'Infinitivo') {
      return acc;
    }

    if (!acc[tense]) {
      acc[tense] = [];
    }

    acc[tense].push({ person, conjugatedVerb });

    return acc;
  }, {} as ConjugationsByTense);

  return conjugationsByTense;
}
