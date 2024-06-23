import { afterEach, expect, it, vi } from 'vitest';
import { VocabularyTester } from './VocabularyTester';
import { cleanup, render, screen } from '@solidjs/testing-library';
import { VocabularyTesterSettings } from './VocabularySettings';
import userEvent from '@testing-library/user-event';

afterEach(() => {
  cleanup();
});

it('should complete the test when last word invalid when in non-repeat mode', async () => {
  const { defaultTestSettings, onDone, userAction } = setup();
  render(() => (
    <VocabularyTester
      words={[
        {
          id: 1,
          list_id: 1,
          original: 'hello',
          translation: 'ahoj',
          notes: undefined,
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
      words={[
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
  const nextWordBtn = screen.getByTitle('Next word');
  // validate
  await userAction.type(input, '{Enter}');
  await userAction.click(nextWordBtn);

  // validate next
  await userAction.type(input, '{Enter}');
  const invalidIcon = screen.getByLabelText('Word guess is invalid');

  expect(invalidIcon).not.toBeNull();
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
