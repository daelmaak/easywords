export interface Conjugation {
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
