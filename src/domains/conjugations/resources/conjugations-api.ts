export interface VerbConjugations {
  exists: boolean;
  langid: number;
  tenses: Tense[];
  auxiliaries?: string[];
  examples: string[];
  verb: string;
}

export interface Tense {
  name: string;
  forms: TenseForm[];
}

export interface TenseForm {
  id: number;
  pronoun: string;
  use: number;
  form: string;
}

export async function fetchVerbixConjugations(
  lang: string,
  verb: string
): Promise<VerbConjugations> {
  const res = await fetch(
    `https://api.verbix.com/conjugator/iv1/ab8e7bb5-9ac6-11e7-ab6a-00089be4dcbc/${lang}/${verb}/json`
  );

  const rawConjugations = await res.json();

  return {
    ...rawConjugations,
    tenses: Object.values(rawConjugations.tenses),
  };
}
