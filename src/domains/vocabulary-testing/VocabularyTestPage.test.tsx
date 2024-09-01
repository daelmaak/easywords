import { MemoryRouter, Navigate, Route } from '@solidjs/router';
import type { Screen } from '@solidjs/testing-library';
import { cleanup, render, screen, waitFor } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, it, vi } from 'vitest';
import { tick } from '~/lib/testing';
import { initTestApp } from '../../init/test-init';
import type { VocabularyDB } from '../vocabularies/resources/vocabulary-api';
import {
  createMockTestProgress,
  createMockVocabularyDB,
} from './util/test-util';
import { VocabularyTestPage } from './VocabularyTestPage';
import { VocabularyTestResultsPage } from '../vocabulary-results/VocabularyTestResultsPage';
import { QueryClientProvider } from '@tanstack/solid-query';

afterEach(() => cleanup());

it('should switch between tested vocabularies without the tester breaking', async () => {
  const { queryClient, vocabularyApi, userAction, dispose } = setup();

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/vocabulary/:id/test" component={VocabularyTestPage} />
        <Route path="*" component={DummyPage} />
      </MemoryRouter>
    </QueryClientProvider>
  ));

  vocabularyApi.fetchVocabulary.mockResolvedValueOnce(vocabulary1);
  let testVocabularyLinks = await screen.findAllByRole('link');
  await userAction.click(testVocabularyLinks[0]);
  let testInput = screen.getByTestId('write-tester-input');
  expect(testInput).toBeInTheDocument();

  const vocabularyTestLinks = await screen.findAllByRole('link');
  const backLink = vocabularyTestLinks[0];
  await userAction.click(backLink);

  vocabularyApi.fetchVocabulary.mockResolvedValueOnce(vocabulary2);
  testVocabularyLinks = await screen.findAllByRole('link');
  await userAction.click(testVocabularyLinks[1]);
  testInput = screen.getByTestId('write-tester-input');
  expect(testInput).toBeInTheDocument();

  dispose();
});

it('should show the test results after finishing test based on user performance', async () => {
  const { queryClient, vocabularyApi, userAction, dispose } = setup();
  const vocabulary = createMockVocabularyDB({ wordAmount: 2 });
  vocabularyApi.fetchVocabulary.mockResolvedValueOnce(vocabulary);

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/vocabulary/:id/test" component={VocabularyTestPage} />
        <Route
          path="/vocabulary/:id/test/results"
          component={VocabularyTestResultsPage}
        />
        <Route
          path="*"
          component={() => <Navigate href="/vocabulary/1/test" />}
        />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const input = screen.getByTestId('write-tester-input');
  await userAction.type(input, 'invalid');

  // validate and next word
  await userAction.type(input, '{Enter}');
  await userAction.type(input, '{Enter}');

  const correctAnswer = getCorrectAnswer(screen, vocabulary);
  await userAction.type(input, correctAnswer);
  await userAction.type(input, '{Enter}');

  // finish the test
  await userAction.type(input, '{Enter}');

  const wordsBreakdownSection = await waitFor(() =>
    screen.getByTestId('results-word-breakdown')
  );
  const breakdownTableRows = Array.from(
    wordsBreakdownSection.querySelectorAll('table > tbody > tr')
  );
  expect(breakdownTableRows.length).toBe(2);

  const wronglyGuessedWord = vocabulary.words.find(
    i => i.translation !== correctAnswer
  )!;
  const correctlyGuessedWord = vocabulary.words.find(
    i => i.translation === correctAnswer
  )!;
  const invalidRow = breakdownTableRows.find(row =>
    row.textContent!.includes(wronglyGuessedWord.original)
  )!;
  const correctRow = breakdownTableRows.find(row =>
    row.textContent!.includes(correctlyGuessedWord.original)
  )!;

  expect(invalidRow.querySelector('td:nth-child(2)')).toHaveTextContent(
    wronglyGuessedWord.original
  );
  const invalidRowButton = invalidRow.querySelector('td:last-child button')!;
  // I don't have a reliable way to test the tooltip content now since when
  // I simulate the hover event, the tooltip doesn't close after unhover.
  expect(invalidRowButton).toHaveTextContent('Open attempt tooltip');

  expect(correctRow.querySelector('td:nth-child(2)')).toHaveTextContent(
    correctlyGuessedWord.original
  );
  const correctRowButton = correctRow.querySelector('td:last-child button')!;
  expect(correctRowButton).toHaveTextContent('Open attempt tooltip');

  dispose();
});

it('should save the test progress upon pausing it and pick it up again when resuming', async () => {
  const { queryClient, vocabularyApi, userAction, dispose } = setup();
  const vocabulary = createMockVocabularyDB({ wordAmount: 2 });
  vocabularyApi.fetchVocabulary.mockResolvedValue(vocabulary);

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/vocabulary/:id/test" component={VocabularyTestPage} />
        <Route path="/vocabulary/:id" component={DummyPage} />
        <Route
          path="*"
          component={() => <Navigate href="/vocabulary/1/test" />}
        />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const input = screen.getByTestId('write-tester-input');
  const correctAnswer = getCorrectAnswer(screen, vocabulary);
  await userAction.type(input, correctAnswer);

  // validate and next word
  await userAction.type(input, '{Enter}');
  await userAction.type(input, '{Enter}');

  // pause the test
  const pauseBtn = screen.getByText('Pause test');
  // brings me to the dummy page
  await userAction.click(pauseBtn);

  // resume the test
  const continueLink = screen.getByText('Continue vocab 1 test');
  await userAction.click(continueLink);
  await tick();

  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toBeInTheDocument();
  expect(progressBar.textContent).toContain('1 out of 2 done');

  dispose();
});

it('should pick up the saved progress of a partial test when resuming', async () => {
  const { queryClient, vocabularyApi, vocabularyProgressApi, dispose } =
    setup();
  const vocabularyDB = createMockVocabularyDB({ wordAmount: 3 });
  vocabularyApi.fetchVocabulary.mockResolvedValue(vocabularyDB);
  vocabularyProgressApi.fetchVocabularyProgress.mockResolvedValue(
    createMockTestProgress(vocabularyDB, { correct: 1, totalPartial: 2 })
  );

  render(() => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Route path="/vocabulary/:id/test" component={VocabularyTestPage} />
        <Route
          path="*"
          component={() => (
            <Navigate href="/vocabulary/1/test?useSavedProgress=true" />
          )}
        />
      </MemoryRouter>
    </QueryClientProvider>
  ));
  await tick();

  const progressBar = screen.getByRole('progressbar');
  expect(progressBar).toBeInTheDocument();
  expect(progressBar.textContent).toContain('1 out of 2 done');

  dispose();
});

function setup() {
  vi.mock('idb-keyval');
  vi.mock('chart.js/auto');

  const initResult = initTestApp();
  const userAction = userEvent.setup();

  return { ...initResult, userAction };
}

export const DummyPage = () => (
  <div>
    <a href="/vocabulary/1/test">Test vocab 1</a>
    <a href="/vocabulary/2/test">Test vocab 2</a>
    <a href="/vocabulary/1/test?useSavedProgress=true">Continue vocab 1 test</a>
  </div>
);

const vocabulary1: VocabularyDB = {
  id: 1,
  country: 'vn',
  updated_at: '2024-02-03',
  name: 'Vocabulary 1',
  words: [
    {
      id: 1,
      created_at: '2024-02-02',
      vocabulary_id: 1,
      original: 'orig 1',
      translation: 'trans 1',
      notes: undefined,
    },
  ],
};

const vocabulary2: VocabularyDB = {
  id: 2,
  country: 'vn',
  updated_at: '2024-02-03',
  name: 'Vocabulary 2',
  words: [
    {
      id: 2,
      created_at: '2024-02-02',
      vocabulary_id: 2,
      original: 'orig 2',
      translation: 'trans 2',
      notes: undefined,
    },
  ],
};

function getCorrectAnswer(screen: Screen, vocabulary: VocabularyDB) {
  const originalToTranslate = screen.getByTestId(
    'original-to-translate'
  ).textContent;
  const correctAnswer = vocabulary.words.find(
    i => i.original === originalToTranslate
  )!.translation;

  return correctAnswer;
}
