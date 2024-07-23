import { HashRouter, Route } from '@solidjs/router';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyTestPage } from './VocabularyTestPage';
import { initTestApp } from '../../init/test-init';
import userEvent from '@testing-library/user-event';
import type { VocabularyDB } from '../vocabularies/resources/vocabulary-api';

afterEach(() => {
  cleanup();
});

it('should switch between tested vocabularies', async () => {
  const { init, userAction } = setup();

  render(() => (
    <HashRouter>
      <Route path="/:id/test" component={VocabularyTestPage} />
      <Route path="*" component={DummyPage} />
    </HashRouter>
  ));

  init.vocabularyApi.fetchVocabulary.mockResolvedValueOnce(vocabulary1);
  let testVocabularyLinks = await screen.findAllByRole('link');
  await userAction.click(testVocabularyLinks[0]);
  let testInput = screen.getByTestId('write-tester-input');
  expect(testInput).toBeInTheDocument();

  const vocabularyTestLinks = await screen.findAllByRole('link');
  const backLink = vocabularyTestLinks[0];
  await userAction.click(backLink);

  init.vocabularyApi.fetchVocabulary.mockResolvedValueOnce(vocabulary2);
  testVocabularyLinks = await screen.findAllByRole('link');
  await userAction.click(testVocabularyLinks[1]);
  testInput = screen.getByTestId('write-tester-input');
  expect(testInput).toBeInTheDocument();
});

function setup() {
  vi.mock('idb-keyval');

  const userAction = userEvent.setup();

  return { init: initTestApp(), userAction };
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
