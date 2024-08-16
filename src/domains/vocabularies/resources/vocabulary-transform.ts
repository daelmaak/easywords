import type { Vocabulary, Word } from '../model/vocabulary-model';
import type { VocabularyDB, WordDB } from './vocabulary-api';

export const transformToVocabulary = (vocabulary: VocabularyDB): Vocabulary => {
  return {
    id: vocabulary.id,
    country: vocabulary.country,
    savedProgress: undefined,
    name: vocabulary.name,
    updatedAt: new Date(vocabulary.updated_at),
    words: vocabulary.words.map(transformToWord),
  };
};

export const transformToVocabularyDB = (
  vocabulary: Vocabulary
): VocabularyDB => ({
  id: vocabulary.id,
  country: vocabulary.country,
  name: vocabulary.name,
  updated_at: vocabulary.updatedAt.toISOString(),
  words: vocabulary.words.map(transformToWordDB),
});

export const transformToWord = (word: WordDB): Word => ({
  id: word.id,
  createdAt: new Date(word.created_at),
  vocabularyId: word.list_id,
  notes: word.notes,
  original: word.original,
  translation: word.translation,
});

export const transformToWordDB = (word: Word): WordDB => ({
  id: word.id,
  created_at: word.createdAt.toISOString(),
  list_id: word.vocabularyId,
  notes: word.notes,
  original: word.original,
  translation: word.translation,
});
