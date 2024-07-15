import type { Component} from 'solid-js';
import { For, Show, createSignal } from 'solid-js';
import type { VocabularyItem } from '../model/vocabulary-model';
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog';
import { WordEditor } from './WordEditor';
import { VocabularyWord } from './VocabularyWord';
import { differenceBy, unionBy } from 'lodash-es';

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
  const [wordDetailToOpen, setWordDetailToOpen] =
    createSignal<VocabularyItem>();
  const [lastSelectedWordIndex, setLastSelectedWordIndex] = createSignal(-1);

  const groupedWordsByCreatedAt = () =>
    props.words.reduce((acc, word) => {
      const createdAt = `${word.createdAt.getFullYear()}.${
        word.createdAt.getMonth() + 1
      }.${word.createdAt.getDate()}`;
      if (!acc[createdAt]) {
        acc[createdAt] = [];
      }
      acc[createdAt].push(word);
      return acc;
    }, {} as Record<string, VocabularyItem[]>);

  const sortedWordsByCreatedAt = (asc: boolean) => {
    return Object.entries(groupedWordsByCreatedAt()).sort(([a], [b]) =>
      asc ? a.localeCompare(b) : b.localeCompare(a)
    );
  };

  const wordSelected = (word: VocabularyItem) =>
    !!props.selectedWords.find(sw => word.id === sw.id);

  function onWordEdited(word: VocabularyItem) {
    props.onWordsEdited([word]);
    setWordDetailToOpen(undefined);
  }

  function onWordSelected(
    word: VocabularyItem,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) {
    const wordIndex = props.words.findIndex(w => w.id === word.id);
    let selectedWords: VocabularyItem[] = [word];

    if (meta?.shiftSelection) {
      const startIndex = Math.min(lastSelectedWordIndex(), wordIndex);
      const endIndex = Math.max(lastSelectedWordIndex(), wordIndex);
      selectedWords = props.words.slice(startIndex, endIndex + 1);
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
      <Show when={wordDetailToOpen()}>
        {word => (
          <Dialog
            open={true}
            onOpenChange={() => setWordDetailToOpen(undefined)}
          >
            <DialogContent>
              <DialogHeader>
                <h2 class="text-lg font-bold">Edit word</h2>
              </DialogHeader>
              <WordEditor word={word()} onChange={onWordEdited} />
            </DialogContent>
          </Dialog>
        )}
      </Show>
      <Show when={props.sort?.by == null}>
        <div class="w-full relative grid justify-center content-start gap-2 sm:grid-cols-[repeat(auto-fit,_22rem)]">
          <For each={props.words}>
            {word => (
              <VocabularyWord
                selected={wordSelected(word)}
                word={word}
                onWordSelected={onWordSelected}
                onWordDetailToOpen={setWordDetailToOpen}
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
                          onWordDetailToOpen={setWordDetailToOpen}
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

export default VocabularyWords;
