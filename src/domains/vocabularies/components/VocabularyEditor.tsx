import { Component, For, Show, createSignal } from 'solid-js';
import { Checkbox } from '~/components/ui/checkbox';
import { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog';
import { WordEditor } from './WordEditor';

interface VocabularyEditorProps {
  words: VocabularyItem[];
  selectedWords: VocabularyItem[];
  vocabulary: Vocabulary;
  onWordsEdited: (words: VocabularyItem[]) => void;
  onWordsSelected: (words: VocabularyItem[]) => void;
}

export const VocabularyEditor: Component<VocabularyEditorProps> = props => {
  const [wordDetailToOpen, setWordDetailToOpen] =
    createSignal<VocabularyItem>();

  function onWordEdited(word: VocabularyItem) {
    props.onWordsEdited([word]);
    setWordDetailToOpen(undefined);
  }

  function onWordToggled(word: VocabularyItem, selected: boolean) {
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
      <div class="w-full grid justify-center content-start grid-cols-[repeat(auto-fit,_20rem)] gap-2">
        <For each={props.words}>
          {word => (
            <div
              class="flex items-center gap-2 cursor-pointer"
              data-testid="editor-word"
              onClick={() => setWordDetailToOpen(word)}
            >
              <Checkbox
                onChange={checked => onWordToggled(word, checked)}
                onClick={e => e.stopPropagation()}
              />
              <span>{word.original}</span>
              <span class="mx-2 text-center">-</span>
              <span>{word.translation}</span>
            </div>
          )}
        </For>
      </div>
    </>
  );
};

export default VocabularyEditor;
