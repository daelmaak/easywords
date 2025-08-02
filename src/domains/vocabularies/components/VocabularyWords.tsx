import type { Component } from 'solid-js';
import { For, onCleanup, onMount } from 'solid-js';
import type { Word } from '../model/vocabulary-model';
import { VocabularyWord } from './VocabularyWord';
import { wordsSelector } from '~/util/selection';
import { observeFirstIntersection } from '~/util/scroll';
import type { VocabularyWordsBlurState } from '../model/vocabulary-state';
import type { CountryCode } from '~/domains/vocabularies/model/countries';

export interface SortState {
  by: keyof Word;
  asc: boolean;
}

interface VocabularyWordsProps {
  sortedWords: Word[];
  selectedWords: Word[];
  blurState?: VocabularyWordsBlurState;
  sortState: SortState;
  vocabularyLang: CountryCode;
  onWordDetail: (word: Word) => void;
  onWordsSelected: (words: Word[]) => void;
}

export const VocabularyWords: Component<VocabularyWordsProps> = props => {
  let scrollNextElement!: HTMLDivElement;
  const [showAllWords, watchAllWordsReached, cleanupAllWordsReached] =
    observeFirstIntersection();

  const selectWords = wordsSelector();

  const sortedPagedWords = () =>
    showAllWords() ? props.sortedWords : props.sortedWords.slice(0, 25);

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
      <dl class="mb-24">
        <For each={sortedPagedWords()}>
          {word => (
            <div class="border-b border-neutral-200">
              <VocabularyWord
                selected={wordSelected(word)}
                word={word}
                blurState={props.blurState}
                vocabularyLang={props.vocabularyLang}
                onWordSelected={onWordSelected}
                onWordDetailToOpen={props.onWordDetail}
              />
            </div>
          )}
        </For>
      </dl>
      <div ref={scrollNextElement}></div>
    </>
  );
};
