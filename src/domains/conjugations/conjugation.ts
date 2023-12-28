export interface Conjugation {
  mood: string;
  tense: string;
  person: string;
  conjugatedVerb: string;
}

export interface ConjugationByTense {
  tense: string;
  conjugations: Conjugation[];
}

export interface ConjugationsByTense {
  [tense: string]: Conjugation[];
}

export interface ConjugationsByMood {
  [mood: string]: ConjugationByTense[];
}

export function groupConjugationsByTense(
  conjugations: Conjugation[]
): ConjugationsByTense {
  return conjugations.reduce((acc, conj) => {
    const { tense } = conj;

    if (!acc[tense]) {
      acc[tense] = [];
    }

    acc[tense].push(conj);

    return acc;
  }, {} as ConjugationsByTense);
}

export function groupConjugationsByMood(
  conjugations: Conjugation[]
): ConjugationsByMood {
  return conjugations.reduce((acc, conj) => {
    const { mood } = conj;

    if (!acc[mood]) {
      acc[mood] = [];
    }

    const tense = acc[mood].find(t => t.tense === conj.tense);

    if (!tense) {
      acc[mood].push({ tense: conj.tense, conjugations: [conj] });
    } else {
      tense.conjugations.push(conj);
    }

    return acc;
  }, {} as ConjugationsByMood);
}
