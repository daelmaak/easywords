import type { ConjugationLang } from '../../model/lang';
import type { Conjugation } from './conjugation';

// Regarding 2p, it would be nice to map it to more readable forms
const unusedPersons = ['vós', '2p'];

export async function fetchConjugationsByTense(
  verb: string,
  lang: ConjugationLang
): Promise<Conjugation[]> {
  const res = await fetch(
    `https://daelmaak.pythonanywhere.com/api/conjugations/${verb}?lang=${lang}`
  );

  const conjugations = (await res.json()) as [string, string, string, string][];

  return conjugations
    .filter(([, , person, verb]) => verb && !unusedPersons.includes(person)) // 2p plural is not used in Portuguese
    .map(c => {
      return {
        mood: c[0],
        tense: c[1],
        person: c[2],
        conjugatedVerb: c[3],
      };
    });
}
