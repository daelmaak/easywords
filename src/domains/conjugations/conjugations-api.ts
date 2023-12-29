import { Conjugation, removeMoodFromTense } from './conjugation';

export async function fetchConjugationsByTense(
  verb: string
): Promise<Conjugation[]> {
  const res = await fetch(
    `https://daelmaak.pythonanywhere.com/api/conjugations?verb=${verb}`
  );

  const conjugations = (await res.json()) as [string, string, string, string][];

  return conjugations
    .filter(([, , , verb]) => verb)
    .map(c => ({
      mood: c[0],
      tense: removeMoodFromTense(c[1], c[0]),
      person: c[2],
      conjugatedVerb: c[3],
    }));
}
