import { MemoryRouter, Navigate, Route } from '@solidjs/router';
import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import VocabularyPage from './VocabularyPage';

it('should filter words based on search', async () => {
  const { userInteraction, dispose } = setup();

  render(() => (
    <MemoryRouter>
      <Route path="/:id" component={VocabularyPage} />
      <Route path="/" component={() => <Navigate href="/1" />} />
    </MemoryRouter>
  ));
  await tick();

  let words = screen.getAllByTestId('editor-word');
  expect(words.length).toBe(2);

  const searchInput = screen.getByTestId('search-input');
  expect(searchInput).toBeTruthy();

  await userInteraction.type(searchInput, 'ahoj');
  words = screen.getAllByTestId('editor-word');
  expect(words.length).toBe(1);

  dispose();
});

function setup() {
  cleanup();
  vi.restoreAllMocks();
  window.scrollTo = vi.fn() as unknown as Window['scrollTo'];

  const userInteraction = userEvent.setup();

  const { vocabularyApi, dispose } = initTestApp();

  vocabularyApi.fetchVocabulary.mockResolvedValue({
    id: 1,
    name: 'Vocabulary 1',
    country: 'cz',
    vocabulary_items: [
      {
        id: 1,
        created_at: '2021-01-01',
        list_id: 1,
        original: 'ahoj',
        translation: 'hello',
        notes: undefined,
      },
      {
        id: 2,
        created_at: '2021-01-01',
        list_id: 1,
        original: 'nashle',
        translation: 'bye',
        notes: undefined,
      },
    ],
  });

  return {
    userInteraction,
    vocabularyApi,
    dispose,
  };
}
