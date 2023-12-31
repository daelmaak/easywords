import { Lang } from '../../model/lang';

type PreferredTenses = {
  [lang in Lang]: {
    [mood: string]: string[] | undefined;
  };
};

const preferredTenses: PreferredTenses = {
  pt: {
    Indicativo: [
      'presente',
      'pretérito imperfeito',
      'pretérito perfeito simples',
    ],
  },
  es: {},
  fr: {},
  it: {},
  en: {},
};

export function sortTenses(
  lang: Lang,
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
