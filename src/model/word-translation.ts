import type { Word } from '~/domains/vocabularies/model/vocabulary-model';

export type WordTranslation = Pick<Word, 'original' | 'translation'> &
  Partial<Pick<Word, 'notes'>>;
