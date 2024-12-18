import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyTester } from './VocabularyTester';
import { cleanup, render, screen } from '@solidjs/testing-library';
import type { VocabularyTesterSettings } from './VocabularySettings';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import type { Word } from '../../vocabularies/model/vocabulary-model';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import { TestWordStatus } from '~/domains/vocabulary-results/model/test-result-model';

import * as nextWord from '../util/next-word';

const TEST_WORDS: Word[] = [
  {
    id: 1,
    createdAt: new Date(),
    vocabularyId: 1,
    original: 'original 1',
    translation: 'translation 1',
    notes: undefined,
    archived: false,
  },
  {
    id: 2,
    createdAt: new Date(),
    vocabularyId: 1,
    original: 'original 2',
    translation: 'translation 2',
    notes: undefined,
    archived: false,
  },
];

afterEach(() => {
  cleanup();
});

it('should complete the test when last word invalid when in non-repeat mode', async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  const words = TEST_WORDS.slice(0, 1);
  const testProgress = createTestProgress(words, false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  await userAction.type(input, 'invalid');

  const checkWordBtn = screen.getByTitle('Check word');
  await userAction.click(checkWordBtn);

  const nextWordBtn = screen.getByTitle('Next word');
  await userAction.click(nextWordBtn);

  expect(onDone).toHaveBeenCalled();
});

it("shouldn't pass with empty input", async () => {
  const { defaultTestSettings, userAction } = setup();
  const words = TEST_WORDS.slice(0, 1);
  const testProgress = createTestProgress(words, false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={vi.fn()}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const checkWordBtn = screen.getByTitle('Check word');
  await userAction.click(checkWordBtn);

  const invalidIcon = screen.getByLabelText('Word guess is invalid');
  expect(invalidIcon).not.toBeNull();
});

it("should still be able to validate with enter even though previous word's validation was unsuccessful", async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  const words = TEST_WORDS.slice(0, 2);
  const testProgress = createTestProgress(words, false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  const nextWordBtn = screen.getByTitle('Next word');
  // validate
  await userAction.type(input, '{Enter}');
  await userAction.click(nextWordBtn);

  // validate next
  await userAction.type(input, '{Enter}');
  const invalidIcon = screen.getByLabelText('Word guess is invalid');

  expect(invalidIcon).not.toBeNull();
});

// Because especially mobile devices like to enter text with spaces at the end
it('should trim words during validaton', async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  const words = [
    {
      ...TEST_WORDS[0],
      translation: 'ahoj ',
    },
  ];
  const testProgress = createTestProgress(words, false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  await userAction.type(input, ' ahoj');

  const checkWordBtn = screen.getByTitle('Check word');
  await userAction.click(checkWordBtn);

  const validIcon = screen.getByLabelText('Word guess is valid');

  expect(validIcon).not.toBeNull();
});

it(`shouldn't pass with incorrect diacritics in strict mode`, async () => {
  const { defaultTestSettings, userAction } = setup();
  const words = [
    {
      ...TEST_WORDS[0],
      translation: 'dạo này',
    },
  ];
  const testProgress = createTestProgress(words, false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={{ ...defaultTestSettings, strictMatch: true }}
      onDone={vi.fn()}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  await userAction.type(input, 'dao nay');
  // validate
  await userAction.type(input, '{Enter}');

  const validIcon = screen.queryByLabelText('Word guess is valid');
  expect(validIcon).not.toBeInTheDocument();
});

it('should keep its validation state after changing the word', async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  const [words, setWords] = createSignal(TEST_WORDS.slice(0, 1));
  const testProgress = createTestProgress(words(), false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words()}
      testProgress={testProgress}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  const checkWordBtn = screen.getByTitle('Check word');

  await userAction.type(input, TEST_WORDS[0].translation);
  await userAction.click(checkWordBtn);

  setWords(words().map(w => ({ ...w, translation: 'ahojik' })));

  const validIcon = screen.getByLabelText('Word guess is valid');
  expect(validIcon).not.toBeNull();

  const nextWordBtn = screen.getByTitle('Next word');
  await userAction.click(nextWordBtn);

  expect(onDone).toHaveBeenCalled();
});

it('should peek after invalid guess', async () => {
  const { defaultTestSettings, userAction } = setup();
  const words = TEST_WORDS.slice(0, 1);
  const testProgress = createTestProgress(words, false);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={defaultTestSettings}
      onDone={vi.fn()}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  const checkWordBtn = screen.getByTitle('Check word');

  await userAction.type(input, 'invalid guess');
  await userAction.click(checkWordBtn);

  const invalidIcon = screen.getByLabelText('Word guess is invalid');
  expect(invalidIcon).toBeInTheDocument();

  const peekedResult = screen.getByRole('alert');
  expect(peekedResult.innerHTML).toContain(TEST_WORDS[0].translation);
  expect(peekedResult.className).not.toContain('invisible');
});

it(`shouldn't repeat the current word right after`, async () => {
  const { defaultTestSettings, userAction } = setup();
  const words = TEST_WORDS.slice(0, 2);
  const testProgress = createTestProgress(words, false);

  vi.spyOn(nextWord, 'nextWord').mockImplementation(words => words[0]);

  render(() => (
    <VocabularyTester
      vocabularyId={1}
      words={words}
      testProgress={testProgress}
      testSettings={{
        ...defaultTestSettings,
        mode: 'guess',
        repeatInvalid: true,
      }}
      onDone={vi.fn()}
      onEditWord={vi.fn()}
      onArchiveWord={vi.fn()}
    />
  ));

  const wordToTranslate = screen.getByTestId('original-to-translate');
  expect(wordToTranslate.textContent).toContain(words[0].original);

  const showSolutionBtn = screen.getByText('Show solution');
  await userAction.click(showSolutionBtn);

  const wrongBtn = screen.getByText('Wrong');
  await userAction.click(wrongBtn);

  expect(wordToTranslate.textContent).not.toContain(words[0].original);
});

function setup() {
  const onDone = vi.fn();
  const defaultTestSettings = {
    mode: 'write',
    reverseTranslations: false,
    repeatInvalid: false,
    strictMatch: false,
  } satisfies VocabularyTesterSettings;

  const userAction = userEvent.setup();

  return { defaultTestSettings, onDone, userAction };
}

function createTestProgress(words: Word[], done: boolean) {
  return {
    id: 1,
    words: words.map(w => ({
      attempts: [],
      word_id: w.id,
      result: TestWordStatus.NotDone,
      created_at: new Date().toISOString(),
      done: false,
    })),
    created_at: new Date().toISOString(),
    done,
    updated_at: new Date().toISOString(),
    vocabulary_id: 1,
  } satisfies TestResult;
}
