import type { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import type { VocabularyDB, VocabularyItemDB } from './vocabulary-api';

export const transformToVocabulary = (vocabulary: VocabularyDB): Vocabulary => {
  return {
    id: vocabulary.id,
    country: vocabulary.country,
    savedProgress: undefined,
    name: vocabulary.name,
    updatedAt: new Date(vocabulary.updated_at),
    vocabularyItems: vocabulary.vocabulary_items.map(transformToVocabularyItem),
  };
};

export const transformToVocabularyDB = (
  vocabulary: Vocabulary
): VocabularyDB => ({
  id: vocabulary.id,
  country: vocabulary.country,
  name: vocabulary.name,
  updated_at: vocabulary.updatedAt.toISOString(),
  vocabulary_items: vocabulary.vocabularyItems.map(transformToVocabularyItemDB),
});

export const transformToVocabularyItem = (
  item: VocabularyItemDB
): VocabularyItem => ({
  id: item.id,
  createdAt: new Date(item.created_at),
  vocabularyId: item.list_id,
  notes: item.notes,
  original: item.original,
  translation: item.translation,
});

export const transformToVocabularyItemDB = (
  item: VocabularyItem
): VocabularyItemDB => ({
  id: item.id,
  created_at: item.createdAt.toISOString(),
  list_id: item.vocabularyId,
  notes: item.notes,
  original: item.original,
  translation: item.translation,
});
