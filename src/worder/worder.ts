import type { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';

export function nextWord(words: VocabularyItem[]): VocabularyItem | undefined {
  if (!words.length) {
    return undefined;
  }

  const i = Math.floor(Math.random() * words.length);

  return words[i];
}
