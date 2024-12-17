import type { Word } from './vocabulary-model';

export type VocabularyWordsBlurState = Record<
  keyof Pick<Word, 'original' | 'translation'>,
  boolean
>;
