import { Conjugation } from './conjugation';

export async function fetchConjugationsByTense(
  verb: string
): Promise<Conjugation[]> {
  const res = await fetch(
    `https://daelmaak.pythonanywhere.com/api/conjugations?verb=${verb}`
  );

  const conjugations = (await res.json()) as [string, string, string, string][];

  return conjugations.map(c => ({
    mood: c[0],
    tense: c[1],
    person: c[2],
    conjugatedVerb: c[3],
  }));
}
