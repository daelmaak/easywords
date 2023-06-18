import { WordTranslation } from '../parser/simple-md-parser';

export function nextWord(
  words: WordTranslation[]
): [WordTranslation, number] | undefined {
  if (!words.length) {
    return undefined;
  }

  const i = Math.floor(Math.random() * words.length);
  const { original, translation } = words[i];

  return [{ original, translation }, i];
}
