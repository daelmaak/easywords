import { HashRouter, Navigate, Route } from '@solidjs/router';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyTestPage } from './VocabularyTestPage';
import { initTestApp } from '../../init/test-init';
import userEvent from '@testing-library/user-event';
import type { VocabularyDB } from '../vocabularies/resources/vocabulary-api';
import { createMockVocabularyDB } from './util/test-util';
import { tick } from '~/lib/testing';

afterEach(() => {
  cleanup();
});

it('should switch between tested vocabularies without the tester breaking', async () => {
  const { vocabularyApi, userAction } = setup();

  render(() => (
    <HashRouter>
      <Route path="/:id/test" component={VocabularyTestPage} />
      <Route path="*" component={DummyPage} />
    </HashRouter>
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
});

it('should show the test results after finishing test based on user performance', async () => {
  const { vocabularyApi, userAction } = setup();
  const vocabulary = createMockVocabularyDB({ wordAmount: 2 });
  vocabularyApi.fetchVocabulary.mockResolvedValueOnce(vocabulary);

  render(() => (
    <HashRouter>
      <Route path="/:id/test" component={VocabularyTestPage} />
      <Route path="*" component={() => <Navigate href="/1/test" />} />
    </HashRouter>
  ));
  await tick();

  const input = screen.getByTestId('write-tester-input');
  await userAction.type(input, 'invalid');

  // validate and next word
  await userAction.type(input, '{Enter}');
  await userAction.type(input, '{Enter}');

  const originalToTranslate = screen.getByTestId(
    'original-to-translate'
  ).textContent;
  const correctAnswer = vocabulary.vocabulary_items.find(
    i => i.original === originalToTranslate
  )!.translation;
  await userAction.type(input, correctAnswer);
  await userAction.type(input, '{Enter}');
  await userAction.type(input, '{Enter}');

  const resultInvalidWords = screen.getByTestId('results-invalid-words');
  const invalidWords = resultInvalidWords.querySelectorAll('li');

  expect(invalidWords.length).toBe(1);

  const wronglyGuessedWord = vocabulary.vocabulary_items.find(
    i => i.original !== originalToTranslate
  );
  expect(invalidWords[0].textContent).toContain(wronglyGuessedWord!.original);
});

function setup() {
  vi.mock('idb-keyval');

  const { vocabularyApi } = initTestApp();
  const userAction = userEvent.setup();

  return { vocabularyApi, userAction };
}

export const DummyPage = () => (
  <>
    <a href="/1/test">Test vocab 1</a>
    <a href="/2/test">Test vocab 2</a>
  </>
);

const vocabulary1: VocabularyDB = {
  id: 1,
  country: 'vn',
  updated_at: '2024-02-03',
  name: 'Vocabulary 1',
  vocabulary_items: [
    {
      id: 1,
      created_at: '2024-02-02',
      list_id: 1,
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
  vocabulary_items: [
    {
      id: 2,
      created_at: '2024-02-02',
      list_id: 2,
      original: 'orig 2',
      translation: 'trans 2',
      notes: undefined,
    },
  ],
};
