import { cleanup, render } from '@solidjs/testing-library';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { createSignal } from 'solid-js';
import { afterEach, expect, it, vi } from 'vitest';
import type { Word } from '../model/vocabulary-model';
import { VocabularyWords } from './VocabularyWords';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it('should shift select all items in between', async () => {
  const { onWordDetail, user } = setup();

  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  // I am putting random alphabetical order into the retrieved words so that when
  // they get sorted a-z, they will have to appear in a different order than they were.
  const words = generateWords(5, (item, i) => ({
    ...item,
    original: i % 2 > 0 ? 'ahoj' : 'hello',
  }));

  const { getAllByRole } = render(() => (
    <VocabularyWords
      words={words}
      selectedWords={selectedWords()}
      sortState={{ by: 'original', asc: true }}
      onWordDetail={onWordDetail}
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
  const { onWordDetail, user } = setup();

  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  const words = generateWords(5);

  const { getAllByRole } = render(() => (
    <VocabularyWords
      words={words}
      selectedWords={selectedWords()}
      sortState={{ by: 'original', asc: true }}
      onWordDetail={onWordDetail}
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

it('should shift select all items in between when sorted by date added', async () => {
  const { onWordDetail, user } = setup();

  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  // I have to "randomize" the dates a little so that the words stack up differently
  // than in the default sorting.
  const words = generateWords(5, (item, i) => ({
    ...item,
    createdAt: new Date(2021, 1, i % 2 > 0 ? 1 : 2),
  }));

  const { getAllByRole } = render(() => (
    <VocabularyWords
      words={words}
      selectedWords={selectedWords()}
      sortState={{ by: 'createdAt', asc: false }}
      onWordDetail={onWordDetail}
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
  factoryFn?: (item: Word, i: number) => Word
): Word[] {
  return Array.from({ length: amount }, (_, i) => ({
    id: i,
    createdAt: new Date(),
    vocabularyId: 1,
    original: 'hello_' + i,
    translation: 'ahoj' + i,
    notes: 'note' + i,
    archived: false,
  })).map(factoryFn ?? (item => item));
}

async function shiftClick(el: Element, userEvent: UserEvent) {
  await userEvent.keyboard('{Shift>}');
  await userEvent.click(el);
  await userEvent.keyboard('{/Shift}');
}

function setup() {
  const onWordDetail = vi.fn();
  const onWordSelected = vi.fn();

  const user = userEvent.setup();

  return {
    onWordDetail,
    onWordSelected,
    user,
  };
}
