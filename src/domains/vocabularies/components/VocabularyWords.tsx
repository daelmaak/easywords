import type { Component } from 'solid-js';
import { For, Show, createMemo, createSignal } from 'solid-js';
import type { Word } from '../model/vocabulary-model';
import { VocabularyWord } from './VocabularyWord';
import { WordEditorDialog } from './WordEditorDialog';
import { wordsSelector } from '~/util/selection';

export interface SortState {
  by: keyof Word;
  asc: boolean;
}

interface VocabularyWordsProps {
  words: Word[];
  selectedWords: Word[];
  sort: SortState;
  onWordsEdited: (words: Word[]) => void;
  onWordsSelected: (words: Word[]) => void;
}

export const VocabularyWords: Component<VocabularyWordsProps> = props => {
  const [wordToEdit, setWordToEdit] = createSignal<Word>();
  const selectWords = wordsSelector();

  const groupedWordsByCreatedAt = createMemo(() =>
    props.words.reduce((acc, word) => {
      const createdAt = new Date(
        word.createdAt.getFullYear(),
        word.createdAt.getMonth(),
        word.createdAt.getDate()
      ).getTime();
      if (!acc.has(createdAt)) {
        acc.set(createdAt, []);
      }
      acc.get(createdAt)!.push(word);
      return acc;
    }, new Map<number, Word[]>())
  );

  const sortedWordsByCreatedAt = createMemo(() => {
    return Array.from(groupedWordsByCreatedAt().entries()).sort(([a], [b]) =>
      props.sort.asc ? a - b : b - a
    );
  });

  const sortedWords = createMemo(() => {
    const sortBy = props.sort.by;
    const sortAsc = props.sort.asc;

    if (sortBy === 'createdAt') {
      return sortedWordsByCreatedAt().flatMap(([_, words]) => words);
    }

    return props.words.slice().sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aNum = parseInt(aValue);
        const bNum = parseInt(bValue);

        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortAsc ? aNum - bNum : bNum - aNum;
        } else {
          return sortAsc
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortAsc ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  });

  const wordSelected = (word: Word) =>
    !!props.selectedWords.find(sw => word.id === sw.id);

  function onWordEdited(word: Word) {
    props.onWordsEdited([word]);
    setWordToEdit(undefined);
  }

  function onWordSelected(
    word: Word,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) {
    const selectedWords = selectWords(
      word,
      selected,
      sortedWords(),
      props.selectedWords,
      meta
    );

    props.onWordsSelected(selectedWords);
  }

  return (
    <div class="relative w-full h-full p-2 flex flex-col items-center bg-gray-100 rounded-md">
      <WordEditorDialog
        word={wordToEdit()}
        open={wordToEdit() != null}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />
      <Show when={props.sort.by !== 'createdAt'}>
        <ul class="flex flex-col items-start gap-0.5">
          <For each={sortedWords()}>
            {word => (
              <li>
                <VocabularyWord
                  selected={wordSelected(word)}
                  word={word}
                  onWordSelected={onWordSelected}
                  onWordDetailToOpen={setWordToEdit}
                />
              </li>
            )}
          </For>
        </ul>
      </Show>
      <Show when={props.sort.by === 'createdAt'}>
        <div>
          <For each={sortedWordsByCreatedAt()}>
            {([, words]) => (
              <section>
                <h3 class="mt-4 mb-1 w-full font-semibold">
                  {words[0].createdAt.toDateString()}
                </h3>
                <ul class="flex flex-col items-start gap-0.5">
                  <For each={words}>
                    {word => (
                      <li>
                        <VocabularyWord
                          selected={wordSelected(word)}
                          word={word}
                          onWordSelected={onWordSelected}
                          onWordDetailToOpen={setWordToEdit}
                        />
                      </li>
                    )}
                  </For>
                </ul>
              </section>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
