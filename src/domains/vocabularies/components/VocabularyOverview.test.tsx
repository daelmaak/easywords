import { cleanup, render, screen } from '@solidjs/testing-library';
import { createResource } from 'solid-js';
import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyList } from '../vocabulary-model';
import {
  VocabularyOverview,
  Props as VocabularyOverviewProps,
} from './VocabularyOverview';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should render an empty vocabulary overview if none exist', async () => {
  const { fetchVocabularies, vocabularyApi, onTestVocabulary } = setup();
  render(() => (
    <VocabularyOverview
      vocabularyApi={vocabularyApi}
      fetchVocabularies={fetchVocabularies}
      onTestVocabulary={onTestVocabulary}
    />
  ));

  const emptyScreenWidget = screen.getByTestId('empty-vocabulary-list');
  expect(emptyScreenWidget).toBeTruthy();
});

function setup() {
  return {
    fetchVocabularies: createResource<VocabularyList[]>(() => []),
    vocabularyApi: {
      createVocabularyList: () => Promise.resolve(true),
      deleteVocabularyList: () => Promise.resolve(true),
      fetchVocabularyLists: () => Promise.resolve([]),
      updateVocabularyItem: () => Promise.resolve(true),
    },
    onTestVocabulary: vi.fn(),
  } satisfies VocabularyOverviewProps;
}
