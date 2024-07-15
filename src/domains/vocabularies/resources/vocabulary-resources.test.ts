import { assert, expect, test } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import type {
  VocabularyItemToCreate} from './vocabulary-resource';
import {
  createVocabularyItems,
  getVocabulary,
  updateVocabularyItems
} from './vocabulary-resource';
import type { VocabularyDB } from './vocabulary-api';

test('updates the vocabulary resource on word edit', async () => {
  const { vocabularyApi, dispose } = setup();
  const mockVocabulary: VocabularyDB = {
    id: 1,
    country: 'at',
    name: 'Test Vocabulary',
    vocabulary_items: [
      {
        id: 1,
        created_at: '2021-01-01',
        list_id: 1,
        original: 'original',
        translation: 'translation',
        notes: undefined,
      },
    ],
  };

  vocabularyApi.fetchVocabulary.mockResolvedValue(mockVocabulary);
  vocabularyApi.updateVocabularyItems.mockResolvedValue(true);

  const vocabulary = getVocabulary(1);
  await tick();

  const currVocabulary = vocabulary();
  assert(currVocabulary);

  await updateVocabularyItems({
    ...currVocabulary.vocabularyItems[0],
    original: 'new original',
  });

  expect(vocabulary()?.vocabularyItems[0].original).toBe('new original');

  dispose();
});

test('updates the vocabulary resource on words addition', async () => {
  const { vocabularyApi, dispose } = setup();
  const mockVocabulary: VocabularyDB = {
    id: 1,
    country: 'at',
    name: 'Test Vocabulary',
    vocabulary_items: [
      {
        id: 1,
        created_at: '2021-01-01',
        list_id: 1,
        original: 'original',
        translation: 'translation',
        notes: undefined,
      },
    ],
  };

  const wordToAdd: VocabularyItemToCreate = {
    vocabularyId: 1,
    original: 'new original',
    translation: 'new translation',
    notes: undefined,
  };

  vocabularyApi.fetchVocabulary.mockResolvedValue(mockVocabulary);
  vocabularyApi.createVocabularyItems.mockResolvedValue([
    { id: 2, created_at: '2021-01-01', list_id: 1, ...wordToAdd },
  ]);

  const vocabulary = getVocabulary(1);
  await tick();

  assert(vocabulary());

  await createVocabularyItems(1, wordToAdd);

  expect(vocabulary()?.vocabularyItems.length).toBe(2);
  expect(vocabulary()?.vocabularyItems[1].original).toBe(wordToAdd.original);

  dispose();
});

function setup() {
  return initTestApp();
}
