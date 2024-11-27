import type { CountryCode } from '~/components/country-select/countries';
import type { Vocabulary, Word } from '../model/vocabulary-model';
import type { VocabularyDB, WordDB } from './vocabulary-api';

export const transformToVocabulary = (
  vocabularyDB: VocabularyDB
): Vocabulary => {
  const vocabulary: Vocabulary = {
    id: vocabularyDB.id,
    country: vocabularyDB.country as CountryCode,
    name: vocabularyDB.name,
    words: vocabularyDB.words.map(transformToWord),
    archived: vocabularyDB.archived ?? false,
  };

  if (vocabularyDB.updated_at) {
    vocabulary.updatedAt = new Date(vocabularyDB.updated_at);
  }

  return vocabulary;
};

export const transformToWord = (word: WordDB): Word => ({
  id: word.id,
  archived: word.archived ?? false,
  createdAt: new Date(word.created_at),
  vocabularyId: word.vocabulary_id,
  notes: word.notes,
  original: word.original,
  translation: word.translation,
});

export const transformToWordDB = (word: Word): WordDB => ({
  id: word.id,
  archived: word.archived,
  created_at: word.createdAt.toISOString(),
  vocabulary_id: word.vocabularyId,
  notes: word.notes,
  original: word.original,
  translation: word.translation,
});
