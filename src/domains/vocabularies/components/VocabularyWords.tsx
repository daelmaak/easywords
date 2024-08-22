import type { Component } from 'solid-js';
import { For, Show, createSignal } from 'solid-js';
import type { Word } from '../model/vocabulary-model';
import { VocabularyWord } from './VocabularyWord';
import { differenceBy, unionBy } from 'lodash-es';
import { WordEditorDialog } from './WordEditorDialog';

export interface SortState {
  by?: 'created_at' | undefined;
  asc: boolean;
}

interface VocabularyWordsProps {
  words: Word[];
  selectedWords: Word[];
  sort?: SortState;
  onWordsEdited: (words: Word[]) => void;
  onWordsSelected: (words: Word[]) => void;
}

export const VocabularyWords: Component<VocabularyWordsProps> = props => {
  const [wordToEdit, setWordToEdit] = createSignal<Word>();
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
    }, new Map<number, Word[]>());

  const sortedWordsAlphabetically = () =>
    props.words.slice().sort((a, b) => a.original.localeCompare(b.original));

  const sortedWordsByCreatedAt = (asc: boolean) => {
    return Array.from(groupedWordsByCreatedAt().entries()).sort(([a], [b]) =>
      asc ? a - b : b - a
    );
  };

  const sortedWords = () =>
    props.sort?.by === 'created_at'
      ? sortedWordsByCreatedAt(props.sort.asc).flatMap(([, ws]) => ws)
      : sortedWordsAlphabetically();

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
    const wordIndex = sortedWords().findIndex(w => w.id === word.id);
    let selectedWords: Word[] = [word];

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
    <div class="relative w-full h-full p-2 flex flex-col items-center bg-gray-100 rounded-md">
      <WordEditorDialog
        word={wordToEdit()}
        open={wordToEdit() != null}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />
      <Show when={props.sort?.by == null}>
        <ul class="flex flex-col items-start gap-2">
          <For each={sortedWordsAlphabetically()}>
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
      <Show when={props.sort}>
        {sort => (
          <Show when={sort().by === 'created_at'}>
            <div>
              <For each={sortedWordsByCreatedAt(sort().asc)}>
                {([, words]) => (
                  <section>
                    <h3 class="mt-4 mb-2 w-full font-semibold">
                      {words[0].createdAt.toDateString()}
                    </h3>
                    <ul class="flex flex-col items-start gap-2">
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
        )}
      </Show>
    </div>
  );
};
