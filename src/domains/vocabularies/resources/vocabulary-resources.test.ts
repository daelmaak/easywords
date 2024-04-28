import { expect, test } from 'vitest';
import { initTestApp } from '~/init/test-init';
import {
    createVocabularyItems,
    getVocabulariesResource,
    updateVocabularyItems,
} from './vocabulary-resources';
import { Vocabulary } from '../model/vocabulary-model';

test('updates the vocabularies resources on word edit', async () => {
  const { vocabularyApi } = setup();
  const vocabulary: Vocabulary = {
    id: 1,
    country: 'at',
    name: 'Test Vocabulary',
    hasSavedProgress: false,
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
  vocabularyApi.updateVocabularyItems.mockResolvedValue(true);

  // Use `createRoot` here? Test works without it but I am not sure resources are
  // cleaned up properly.
  const [vocabularies] = getVocabulariesResource();

  await updateVocabularyItems(1, {
    ...vocabulary.vocabularyItems[0],
    original: 'new original',
  });

  expect(vocabularies()?.[0].vocabularyItems[0].original).toBe('new original');
});

test('updates the vocabularies resources on words addition', async () => {
  const { vocabularyApi } = setup();
  const vocabulary: Vocabulary = {
    id: 1,
    country: 'at',
    name: 'Test Vocabulary',
    hasSavedProgress: false,
    vocabularyItems: [
      {
        id: 1,
        list_id: 1,
        original: 'original',
        translation: 'translation',
      },
    ],
  };

  const wordToAdd = {
    original: 'new original',
    translation: 'new translation',
  };

  vocabularyApi.fetchVocabularyLists.mockResolvedValue([vocabulary]);
  vocabularyApi.createVocabularyItems.mockResolvedValue([
    { id: 2, list_id: 1, ...wordToAdd },
  ]);

  const [vocabularies] = getVocabulariesResource();

  await createVocabularyItems(1, wordToAdd);

  expect(vocabularies()?.[0].vocabularyItems.length).toBe(2);
  expect(vocabularies()?.[0].vocabularyItems[1].original).toBe(
    wordToAdd.original
  );
});

function setup() {
  return initTestApp();
}
