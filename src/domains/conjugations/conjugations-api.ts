import { Conjugation, removeMoodFromTense } from './conjugation';

export async function fetchConjugationsByTense(
  verb: string
): Promise<Conjugation[]> {
  const res = await fetch(
    `https://daelmaak.pythonanywhere.com/api/conjugations?verb=${verb}`
  );

  const conjugations = (await res.json()) as [string, string, string, string][];

  return conjugations
    .filter(([, , person, verb]) => verb && person !== 'vós') // 2p plural is not used in Portuguese
    .map(c => {
      return {
        mood: c[0],
        tense: capitalizeFirstLetter(removeMoodFromTense(c[1], c[0])),
        person: c[2],
        conjugatedVerb: c[3],
      };
    });
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
