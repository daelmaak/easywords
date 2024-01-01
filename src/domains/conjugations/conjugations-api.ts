import { Lang } from '../../model/lang';
import { Conjugation, removeMoodFromTense } from './conjugation';

export async function fetchConjugationsByTense(
  verb: string,
  lang: Lang
): Promise<Conjugation[]> {
  const res = await fetch(
    `https://daelmaak.pythonanywhere.com/api/conjugations/${verb}?lang=${lang}`
  );

  const conjugations = (await res.json()) as [string, string, string, string][];

  return conjugations
    .filter(([, , person, verb]) => verb && person !== 'vós') // 2p plural is not used in Portuguese
    .map(c => {
      return {
        mood: c[0],
        tense: c[1],
        person: c[2],
        conjugatedVerb: c[3],
      };
    });
}
