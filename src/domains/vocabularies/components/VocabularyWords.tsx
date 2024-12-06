import type { Component } from 'solid-js';
import { For, createMemo, onCleanup, onMount } from 'solid-js';
import type { Word } from '../model/vocabulary-model';
import { VocabularyWord } from './VocabularyWord';
import { wordsSelector } from '~/util/selection';
import { observeFirstIntersection } from '~/util/scroll';

export interface SortState {
  by: keyof Word;
  asc: boolean;
}

interface VocabularyWordsProps {
  words: Word[];
  selectedWords: Word[];
  sortState: SortState;
  onWordDetail: (word: Word) => void;
  onWordsSelected: (words: Word[]) => void;
}

export const VocabularyWords: Component<VocabularyWordsProps> = props => {
  let scrollNextElement!: HTMLDivElement;
  const [showAllWords, watchAllWordsReached, cleanupAllWordsReached] =
    observeFirstIntersection();

  const selectWords = wordsSelector();

  const sortedWords = createMemo(() => {
    const sortBy = props.sortState.by;
    const sortAsc = props.sortState.asc;

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

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortAsc ? (aValue ? 1 : -1) : bValue ? 1 : -1;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortAsc
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // if only one value is defined, prefer the defined one
      if ((aValue == null || bValue == null) && aValue != bValue) {
        return sortAsc ? (aValue ? 1 : -1) : aValue ? -1 : 1;
      }

      return 0;
    });
  });

  const sortedPagedWords = () =>
    showAllWords() ? sortedWords() : sortedWords().slice(0, 25);

  const wordSelected = (word: Word) =>
    !!props.selectedWords.find(sw => word.id === sw.id);

  onMount(() => {
    watchAllWordsReached(scrollNextElement);
  });

  onCleanup(() => {
    cleanupAllWordsReached();
  });

  function onWordSelected(
    word: Word,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) {
    const selectedWords = selectWords(
      word,
      selected,
      sortedPagedWords(),
      props.selectedWords,
      meta
    );

    props.onWordsSelected(selectedWords);
  }

  return (
    <>
      <ul class="mb-24">
        <For each={sortedPagedWords()}>
          {word => (
            <li class="border-b border-neutral-200">
              <VocabularyWord
                selected={wordSelected(word)}
                word={word}
                onWordSelected={onWordSelected}
                onWordDetailToOpen={props.onWordDetail}
              />
            </li>
          )}
        </For>
      </ul>
      <div ref={scrollNextElement}></div>
    </>
  );
};
