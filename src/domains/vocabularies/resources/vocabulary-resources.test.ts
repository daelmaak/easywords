import { expect, test } from 'vitest';
import { initTestApp } from '~/init/test-init';
import {
  getVocabulariesResource,
  updateVocabularyItems,
} from './vocabulary-resources';
import { Vocabulary } from '../vocabulary-model';

test('updates the vocabularies resources on word edit', async () => {
  const { vocabularyApi } = setup();
  const vocabulary: Vocabulary = {
    id: 1,
    name: 'Test Vocabulary',
    vocabularyItems: [
      {
        id: 1,
        list_id: 1,
        original: 'original',
        translation: 'translation',
      },
    ],
  };

  vocabularyApi.fetchVocabularyLists.mockResolvedValue([vocabulary]);
  vocabularyApi.updateVocabularyItem.mockResolvedValue(true);

  // Use `createRoot` here? Test works without it but I am not sure resources are
  // cleaned up properly.
  const [vocabularies] = getVocabulariesResource();

  await updateVocabularyItems(1, {
    ...vocabulary.vocabularyItems[0],
    original: 'new original',
  });

  expect(vocabularies()?.[0].vocabularyItems[0].original).toBe('new original');
});

function setup() {
  return initTestApp();
}
