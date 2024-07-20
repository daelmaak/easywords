import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, expect, it, vi } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import { VocabulariesPage } from './VocabulariesPage';
import { MemoryRouter, Route } from '@solidjs/router';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should render an empty vocabulary overview if none exist', async () => {
  const { vocabularyApi } = setup();

  vocabularyApi.fetchVocabularies.mockResolvedValue([]);

  render(() => (
    <MemoryRouter>
      <Route path="/" component={VocabulariesPage} />
    </MemoryRouter>
  ));
  await tick();

  expect(screen.getByText('Your vocabularies')).toBeTruthy();

  const emptyScreenWidget = screen.getByTestId('empty-vocabulary-list');
  expect(emptyScreenWidget).toBeTruthy();
});

function setup() {
  const { vocabularyApi } = initTestApp();

  return {
    vocabularyApi,
  };
}
