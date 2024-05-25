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
