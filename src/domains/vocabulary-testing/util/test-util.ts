import type {
  VocabularyDB,
  VocabularyItemDB,
} from '~/domains/vocabularies/resources/vocabulary-api';

export function createMockVocabularyDB(config: {
  wordAmount: number;
}): VocabularyDB {
  const words: VocabularyItemDB[] = Array.from(
    { length: config.wordAmount },
    (_, index) => ({
      id: index,
      created_at: String(new Date().getTime()),
      list_id: 1,
      original: `original${index}`,
      translation: `translation${index}`,
      notes: '',
    })
  );

  return {
    id: 1,
    name: 'Vocabulary title',
    country: 'cz',
    vocabulary_items: words,
    updated_at: new Date(),
  };
}
