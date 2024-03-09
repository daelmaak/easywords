import { WordTranslation } from '~/model/word-translation';

export function nextWord(
  words: WordTranslation[]
): WordTranslation | undefined {
  if (!words.length) {
    return undefined;
  }

  const i = Math.floor(Math.random() * words.length);
  const { original, translation } = words[i];

  return { original, translation };
}
