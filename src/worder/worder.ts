import { WordTranslation } from '../parser/simple-md-parser';

export function nextWord(
  words: WordTranslation[],
  reverse = false
): [WordTranslation, number] | undefined {
  if (!words.length) {
    return undefined;
  }

  const i = Math.floor(Math.random() * words.length);
  const { original, translation } = words[i];

  return [
    reverse
      ? { original: translation, translation: original }
      : { original, translation },
    i,
  ];
}
