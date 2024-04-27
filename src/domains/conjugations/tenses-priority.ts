import { ConjugationLang } from '../../model/lang';

type PreferredTenses = {
  [lang in ConjugationLang]: {
    [mood: string]: string[] | undefined;
  };
};

const preferredTenses: PreferredTenses = {
  pt: {
    Indicativo: [
      'indicativo presente',
      'indicativo pretérito imperfeito',
      'indicativo pretérito perfeito simples',
    ],
  },
  es: {},
  fr: {},
  it: {},
  en: {},
};

export function sortTenses(
  lang: ConjugationLang,
  mood: string,
  tenses: string[]
): string[] {
  const preferredTensesByMood = preferredTenses[lang][mood];

  if (!preferredTensesByMood) {
    return tenses;
  }

  return tenses.slice().sort((a, b) => {
    const aIndex = preferredTensesByMood.indexOf(a.toLocaleLowerCase());
    const bIndex = preferredTensesByMood.indexOf(b.toLocaleLowerCase());

    if (aIndex === -1) {
      return 1;
    }

    if (bIndex === -1) {
      return -1;
    }

    return aIndex - bIndex;
  });
}
