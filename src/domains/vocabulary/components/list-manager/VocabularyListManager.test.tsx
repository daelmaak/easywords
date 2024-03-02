import { cleanup, render, screen } from '@solidjs/testing-library';
import { createResource } from 'solid-js';
import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyListManager } from './VocabularyListManager';
import { VocabularyList } from '../../vocabulary-model';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should render a vocabulary list creator after transition from empty vocabulary widget', async () => {
  const { fetchVocabularyList } = setup();
  render(() => <VocabularyListManager fetchVocabulary={fetchVocabularyList} />);

  const emptyScreenWidget = screen.getByTestId('empty-vocabulary-list');
  expect(emptyScreenWidget).toBeTruthy();

  const createButton = screen.getByText('Create');
  createButton.click();

  const listCreator = screen.getByTestId('list-creator');
  expect(listCreator).toBeTruthy();
});

function setup() {
  return {
    fetchVocabularyList: createResource<VocabularyList[]>(() => []),
  };
}
