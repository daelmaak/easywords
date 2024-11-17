import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';

export function nextWord(words: TestResultWord[]): TestResultWord | undefined {
  if (!words.length) {
    return undefined;
  }

  const i = Math.floor(Math.random() * words.length);

  return words[i];
}
