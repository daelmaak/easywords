import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, expect, it, vi } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import { getVocabulariesResource } from '../resources/vocabulary-resources';
import { VocabularyOverview } from './VocabularyOverview';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should render an empty vocabulary overview if none exist', async () => {
  const { getVocabulariesResource, vocabularyApi } = setup();

  vocabularyApi.fetchVocabularyLists.mockResolvedValue([]);

  render(() => (
    <VocabularyOverview
      vocabulariesResource={getVocabulariesResource()}
      onTestVocabulary={vi.fn()}
    />
  ));
  await tick();

  expect(screen.getByText('Your vocabularies')).toBeTruthy();

  const emptyScreenWidget = screen.getByTestId('empty-vocabulary-list');
  expect(emptyScreenWidget).toBeTruthy();
});

function setup() {
  const { vocabularyApi } = initTestApp();

  return {
    getVocabulariesResource,
    vocabularyApi,
  };
}
