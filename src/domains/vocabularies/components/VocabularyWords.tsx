import type { Component } from 'solid-js';
import { For, Show, createSignal } from 'solid-js';
import type { VocabularyItem } from '../model/vocabulary-model';
import { VocabularyWord } from './VocabularyWord';
import { differenceBy, unionBy } from 'lodash-es';
import { WordEditorDialog } from './WordEditorDialog';

export interface SortState {
  by?: 'created_at' | undefined;
  asc: boolean;
}

interface VocabularyWordsProps {
  words: VocabularyItem[];
  selectedWords: VocabularyItem[];
  sort?: SortState;
  onWordsEdited: (words: VocabularyItem[]) => void;
  onWordsSelected: (words: VocabularyItem[]) => void;
}

export const VocabularyWords: Component<VocabularyWordsProps> = props => {
  const [wordToEdit, setWordToEdit] = createSignal<VocabularyItem>();
  const [lastSelectedWordIndex, setLastSelectedWordIndex] = createSignal(-1);

  const groupedWordsByCreatedAt = () =>
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
    }, new Map<number, VocabularyItem[]>());

  const sortedWordsByCreatedAt = (asc: boolean) => {
    return Array.from(groupedWordsByCreatedAt().entries()).sort(([a], [b]) =>
      asc ? a - b : b - a
    );
  };

  const sortedWords = () =>
    props.sort?.by === 'created_at'
      ? sortedWordsByCreatedAt(props.sort.asc).flatMap(([, ws]) => ws)
      : props.words;

  const wordSelected = (word: VocabularyItem) =>
    !!props.selectedWords.find(sw => word.id === sw.id);

  function onWordEdited(word: VocabularyItem) {
    props.onWordsEdited([word]);
    setWordToEdit(undefined);
  }

  function onWordSelected(
    word: VocabularyItem,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) {
    const wordIndex = sortedWords().findIndex(w => w.id === word.id);
    let selectedWords: VocabularyItem[] = [word];

    if (meta?.shiftSelection) {
      const startIndex = Math.min(lastSelectedWordIndex(), wordIndex);
      const endIndex = Math.max(lastSelectedWordIndex(), wordIndex);
      selectedWords = sortedWords().slice(startIndex, endIndex + 1);
    }

    if (selected) {
      props.onWordsSelected(unionBy(props.selectedWords, selectedWords, 'id'));
    } else {
      props.onWordsSelected(
        differenceBy(props.selectedWords, selectedWords, 'id')
      );
    }

    setLastSelectedWordIndex(wordIndex);
  }

  return (
    <>
      <WordEditorDialog
        word={wordToEdit()}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />
      <Show when={props.sort?.by == null}>
        <div class="w-full relative grid justify-center content-start gap-2 sm:grid-cols-[repeat(auto-fit,_22rem)]">
          <For each={props.words}>
            {word => (
              <VocabularyWord
                selected={wordSelected(word)}
                word={word}
                onWordSelected={onWordSelected}
                onWordDetailToOpen={setWordToEdit}
              />
            )}
          </For>
        </div>
      </Show>
      <Show when={props.sort}>
        {sort => (
          <Show when={sort().by === 'created_at'}>
            <div>
              <For each={sortedWordsByCreatedAt(sort().asc)}>
                {([, words]) => (
                  <section>
                    <h3 class="mt-4 mb-2 w-full">
                      {words[0].createdAt.toDateString()}
                    </h3>
                    <For each={words}>
                      {word => (
                        <VocabularyWord
                          selected={wordSelected(word)}
                          word={word}
                          onWordSelected={onWordSelected}
                          onWordDetailToOpen={setWordToEdit}
                        />
                      )}
                    </For>
                  </section>
                )}
              </For>
            </div>
          </Show>
        )}
      </Show>
    </>
  );
};
