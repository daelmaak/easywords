import type { Component } from 'solid-js';
import { For, createMemo, createSignal } from 'solid-js';
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

  const sortedWords = createMemo(() => {
    const sortBy = props.sort.by;
    const sortAsc = props.sort.asc;

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

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortAsc
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
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
    <div class="relative">
      <WordEditorDialog
        word={wordToEdit()}
        open={wordToEdit() != null}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />
      <ul>
        <For each={sortedWords()}>
          {word => (
            <li class="border-b border-neutral-200">
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
    </div>
  );
};
