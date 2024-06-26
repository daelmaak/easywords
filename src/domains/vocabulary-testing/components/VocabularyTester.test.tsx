import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyTester } from './VocabularyTester';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { VocabularyTesterSettings } from './VocabularySettings';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';

const TEST_WORDS = [
  {
    id: 1,
    list_id: 1,
    original: 'hello',
    translation: 'ahoj',
    notes: undefined,
  },
  {
    id: 2,
    list_id: 1,
    original: 'hi',
    translation: 'ahoj',
    notes: undefined,
  },
];

afterEach(() => {
  cleanup();
});

it('should complete the test when last word invalid when in non-repeat mode', async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  render(() => (
    <VocabularyTester
      words={TEST_WORDS.slice(0, 1)}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onRemoveWord={vi.fn()}
      onRepeat={vi.fn()}
      onReset={vi.fn()}
    />
  ));

  const checkWordBtn = screen.getByTitle('Check word');
  await userAction.click(checkWordBtn);

  const nextWordBtn = screen.getByTitle('Next word');
  await userAction.click(nextWordBtn);

  expect(onDone).toHaveBeenCalled();
});

it("should still be able to validate with enter even though previous word's validation was unsuccessful", async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  render(() => (
    <VocabularyTester
      words={TEST_WORDS.slice(0, 2)}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onRemoveWord={vi.fn()}
      onRepeat={vi.fn()}
      onReset={vi.fn()}
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
  render(() => (
    <VocabularyTester
      words={[
        {
          ...TEST_WORDS[0],
          translation: 'ahoj ',
        },
      ]}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onRemoveWord={vi.fn()}
      onRepeat={vi.fn()}
      onReset={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  await userAction.type(input, ' ahoj');

  const checkWordBtn = screen.getByTitle('Check word');
  await userAction.click(checkWordBtn);

  const validIcon = screen.getByLabelText('Word guess is valid');

  expect(validIcon).not.toBeNull();
});

it('should keep its validation state after changing the word', async () => {
  const [words, setWords] = createSignal(TEST_WORDS.slice(0, 1));

  const { defaultTestSettings, onDone, userAction } = setup();
  render(() => (
    <VocabularyTester
      words={words()}
      testSettings={{ ...defaultTestSettings, repeatInvalid: false }}
      onDone={onDone}
      onEditWord={vi.fn()}
      onRemoveWord={vi.fn()}
      onRepeat={vi.fn()}
      onReset={vi.fn()}
    />
  ));

  const input = screen.getByTestId('write-tester-input');
  const checkWordBtn = screen.getByTitle('Check word');

  await userAction.type(input, TEST_WORDS[0].translation);
  await userAction.click(checkWordBtn);

  setWords([
    {
      ...TEST_WORDS[1],
      translation: 'ahojik',
    },
    ...TEST_WORDS,
  ]);

  const validIcon = screen.getByLabelText('Word guess is valid');
  expect(validIcon).not.toBeNull();

  const nextWordBtn = screen.getByTitle('Next word');
  await userAction.click(nextWordBtn);

  expect(onDone).toHaveBeenCalled();
});

function setup() {
  const onDone = vi.fn();
  const defaultTestSettings = {
    mode: 'write',
    reverseTranslations: false,
    repeatInvalid: false,
  } satisfies VocabularyTesterSettings;

  const userAction = userEvent.setup();

  return { defaultTestSettings, onDone, userAction };
}
