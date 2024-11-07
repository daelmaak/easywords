import { MemoryRouter, Navigate, Route } from '@solidjs/router';
import { cleanup, render, screen } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { initTestApp } from '~/init/test-init';
import { tick } from '~/lib/testing';
import VocabularyPage from './VocabularyPage';
import { addWordViaForm } from './util/test-util';
import { QueryClientProvider } from '@tanstack/solid-query';

afterEach(() => cleanup());

it('should filter words based on search', async () => {
  const { queryClient, userInteraction, dispose } = setup();

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/:id" component={VocabularyPage} />
        <Route path="/" component={() => <Navigate href="/1" />} />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  let words = screen.getAllByRole('listitem');
  expect(words.length).toBe(2);

  const searchInput = screen.getByPlaceholderText('Search words...');
  expect(searchInput).toBeTruthy();

  await userInteraction.type(searchInput, 'ahoj');
  words = screen.getAllByRole('listitem');
  expect(words.length).toBe(1);

  dispose();
});

it('words creator should submit word form if the form is not empty even without clicking "Add word"', async () => {
  const { queryClient, userInteraction, vocabularyApi, dispose } = setup();

  const createWordsSpy = vi.spyOn(vocabularyApi, 'createWords');

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/:id" component={VocabularyPage} />
        <Route path="/" component={() => <Navigate href="/1" />} />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const addWordsBtn = screen.getByText('Add words');
  await userEvent.click(addWordsBtn);
  await addWordViaForm(screen, userInteraction);

  expect(createWordsSpy).not.toHaveBeenCalled();

  const saveBtn = screen.getByText('Save');
  await userEvent.click(saveBtn);

  expect(createWordsSpy).toHaveBeenNthCalledWith(1, [
    {
      original: 'ahoj',
      translation: 'hello',
      vocabulary_id: 1,
      notes: '',
    },
  ]);

  dispose();
});

it('words creator should not attempt words creation if no words filled in', async () => {
  const { queryClient, vocabularyApi, dispose } = setup();

  const createWordsSpy = vi.spyOn(vocabularyApi, 'createWords');

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/:id" component={VocabularyPage} />
        <Route path="/" component={() => <Navigate href="/1" />} />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const addWordsBtn = screen.getByText('Add words');
  await userEvent.click(addWordsBtn);

  const saveBtn = screen.getByText('Save');
  await userEvent.click(saveBtn);

  expect(createWordsSpy).not.toHaveBeenCalled();

  dispose();
});

it('words creator should still attempt words creation if user actively pressed "Add word" button', async () => {
  const { queryClient, userInteraction, vocabularyApi, dispose } = setup();

  const createWordsSpy = vi.spyOn(vocabularyApi, 'createWords');

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/:id" component={VocabularyPage} />
        <Route path="/" component={() => <Navigate href="/1" />} />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const addWordsBtn = screen.getByText('Add words');
  await userEvent.click(addWordsBtn);

  await addWordViaForm(screen, userInteraction, { submit: true });
  expect(createWordsSpy).not.toHaveBeenCalled();

  const saveBtn = screen.getByText('Save');
  await userEvent.click(saveBtn);
  expect(createWordsSpy).toHaveBeenNthCalledWith(1, [
    {
      original: 'ahoj',
      translation: 'hello',
      vocabulary_id: 1,
      notes: '',
    },
  ]);

  dispose();
});

function setup() {
  vi.mock('idb-keyval');

  const userInteraction = userEvent.setup();

  const { queryClient, vocabularyApi, vocabularyTestResultApi, dispose } =
    initTestApp();

  vocabularyApi.fetchVocabulary.mockResolvedValue({
    id: 1,
    name: 'Vocabulary 1',
    country: 'cz',
    updated_at: '2021-02-01',
    words: [
      {
        id: 1,
        created_at: '2021-01-01',
        vocabulary_id: 1,
        original: 'ahoj',
        translation: 'hello',
        notes: undefined,
      },
      {
        id: 2,
        created_at: '2021-01-01',
        vocabulary_id: 1,
        original: 'nashle',
        translation: 'bye',
        notes: undefined,
      },
    ],
  });

  vocabularyTestResultApi.fetchTestResults.mockResolvedValue([]);

  return {
    queryClient,
    userInteraction,
    vocabularyApi,
    dispose,
  };
}
