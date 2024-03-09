import { cleanup, render, screen } from '@solidjs/testing-library';
import { createResource } from 'solid-js';
import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyList } from '../../vocabulary-model';
import { VocabularyOverview } from './VocabularyOverview';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should render an empty vocabulary overview if none exist', async () => {
  const { fetchVocabularyList, vocabularyApi } = setup();
  render(() => (
    <VocabularyOverview
      vocabularyApi={vocabularyApi}
      fetchVocabulary={fetchVocabularyList}
    />
  ));

  const emptyScreenWidget = screen.getByTestId('empty-vocabulary-list');
  expect(emptyScreenWidget).toBeTruthy();
});

function setup() {
  return {
    fetchVocabularyList: createResource<VocabularyList[]>(() => []),
    vocabularyApi: {
      createVocabularyList: async () => Promise.resolve(true),
      deleteVocabularyList: async () => Promise.resolve(true),
      fetchVocabularyLists: async () => [],
    },
  };
}
