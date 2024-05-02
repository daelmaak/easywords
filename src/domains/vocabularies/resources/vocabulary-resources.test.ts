import { createRoot } from 'solid-js';
import { assert, expect, test } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import { Vocabulary } from '../model/vocabulary-model';
import {
  createVocabularyItems,
  getVocabulary,
  updateVocabularyItems,
} from './vocabulary-resource';

test('updates the vocabulary resource on word edit', async () => {
  const { vocabularyApi, dispose } = setup();
  const mockVocabulary: Vocabulary = {
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
  const mockVocabulary: Vocabulary = {
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

  vocabularyApi.fetchVocabulary.mockResolvedValue(mockVocabulary);
  vocabularyApi.createVocabularyItems.mockResolvedValue([
    { id: 2, list_id: 1, ...wordToAdd },
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
  return createRoot(dispose => ({ ...initTestApp(), dispose }));
}
