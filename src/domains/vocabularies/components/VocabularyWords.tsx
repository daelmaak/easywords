import { Component, For, Show, createSignal } from 'solid-js';
import { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog';
import { WordEditor } from './WordEditor';
import { VocabularyWord } from './VocabularyWord';

export interface SortState {
  by?: 'created_at' | undefined;
  asc: boolean;
}

interface VocabularyEditorProps {
  words: VocabularyItem[];
  selectedWords: VocabularyItem[];
  sort?: SortState;
  vocabulary: Vocabulary;
  onWordsEdited: (words: VocabularyItem[]) => void;
  onWordsSelected: (words: VocabularyItem[]) => void;
}

export const VocabularyWords: Component<VocabularyEditorProps> = props => {
  const [wordDetailToOpen, setWordDetailToOpen] =
    createSignal<VocabularyItem>();

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

  function onWordEdited(word: VocabularyItem) {
    props.onWordsEdited([word]);
    setWordDetailToOpen(undefined);
  }

  function onWordSelected(word: VocabularyItem, selected: boolean) {
    const selectedWords = props.selectedWords;
    if (selected) {
      props.onWordsSelected([...selectedWords, word]);
    } else {
      props.onWordsSelected(selectedWords.filter(w => w !== word));
    }
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
