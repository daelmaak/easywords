import type { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';

export type WordTranslation = Pick<VocabularyItem, 'original' | 'translation'> &
  Partial<Pick<VocabularyItem, 'notes'>>;
