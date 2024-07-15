import { cleanup, render } from '@solidjs/testing-library';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { afterEach, expect, it, vi } from 'vitest';
import type { VocabularyItem } from '../model/vocabulary-model';
import VocabularyWords from './VocabularyWords';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should shift select all items in between', async () => {
  const { onWordEdited, user } = setup();

  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const words = generateWords(5);

  const { getAllByRole } = render(() => (
    <VocabularyWords
      words={words}
      selectedWords={selectedWords()}
      onWordsEdited={onWordEdited}
      onWordsSelected={setSelectedWords}
    />
  ));

  const checkboxes: HTMLInputElement[] = getAllByRole('checkbox');
  // This shit should be fixed in Kobalte since clicking the input should work just fine.
  // Yet it doesn't check the visual checkbox so I have to click the sibling div instead.
  const checkboxControls = getAllByRole('checkbox').map(
    e => e.nextElementSibling!
  );
  await user.click(checkboxControls[0]);

  await shiftClick(checkboxControls[3], user);

  expect(selectedWords()).toHaveLength(4);

  const checkedCheckboxes = checkboxes.filter(e => e.checked);
  expect(checkedCheckboxes).toHaveLength(4);
});

it('should shift deselect all items in between', async () => {
  const { onWordEdited, user } = setup();

  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const words = generateWords(5);

  const { getAllByRole } = render(() => (
    <VocabularyWords
      words={words}
      selectedWords={selectedWords()}
      onWordsEdited={onWordEdited}
      onWordsSelected={setSelectedWords}
    />
  ));

  const checkboxes: HTMLInputElement[] = getAllByRole('checkbox');
  const checkboxControls = getAllByRole('checkbox').map(
    e => e.nextElementSibling!
  );
  await user.click(checkboxControls[0]);
  await shiftClick(checkboxControls[3], user);

  await shiftClick(checkboxControls[1], user);

  expect(selectedWords()).toHaveLength(1);

  const checkedCheckboxes = checkboxes.filter(e => e.checked);
  expect(checkedCheckboxes).toHaveLength(1);
});

function setup() {
  const onWordEdited = vi.fn();
  const onWordSelected = vi.fn();

  const user = userEvent.setup();

  return {
    onWordEdited,
    onWordSelected,
    user,
  };
}

it('should shift select all items in between when sorted by date added', async () => {
  const { onWordEdited, user } = setup();

  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  // I have to "randomize" the dates a little so that the words stack up differently
  // than in the default sorting.
  const words = generateWords(5, {
    createdAtFn: i => new Date(2021, 1, i % 2 > 0 ? 1 : 2),
  });

  const { getAllByRole } = render(() => (
    <VocabularyWords
      words={words}
      selectedWords={selectedWords()}
      sort={{ by: 'created_at', asc: false }}
      onWordsEdited={onWordEdited}
      onWordsSelected={setSelectedWords}
    />
  ));

  const checkboxes: HTMLInputElement[] = getAllByRole('checkbox');
  // This shit should be fixed in Kobalte since clicking the input should work just fine.
  // Yet it doesn't check the visual checkbox so I have to click the sibling div instead.
  const checkboxControls = getAllByRole('checkbox').map(
    e => e.nextElementSibling!
  );
  await user.click(checkboxControls[0]);

  await shiftClick(checkboxControls[3], user);

  expect(selectedWords()).toHaveLength(4);

  const checkedCheckboxes = checkboxes.filter(e => e.checked);
  expect(checkedCheckboxes).toHaveLength(4);
});

function generateWords(
  amount: number,
  config?: { createdAtFn: (i: number) => Date }
): VocabularyItem[] {
  return Array.from({ length: amount }, (_, i) => ({
    id: i,
    createdAt: config?.createdAtFn?.(i) ?? new Date(),
    vocabularyId: 1,
    original: 'hello_' + i,
    translation: 'ahoj' + i,
    notes: 'note' + i,
  }));
}

async function shiftClick(el: Element, userEvent: UserEvent) {
  await userEvent.keyboard('{Shift>}');
  await userEvent.click(el);
  await userEvent.keyboard('{/Shift}');
}
