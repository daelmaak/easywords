import { Component, For, Show, createSignal } from 'solid-js';
import { Checkbox } from '~/components/ui/checkbox';
import { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog';
import { WordEditor } from './WordEditor';
import { Popover, PopoverContent } from '~/components/ui/popover';
import { HiOutlinePencil } from 'solid-icons/hi';

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
            <>
              <Popover>
                <PopoverContent>{word.notes}</PopoverContent>
              </Popover>
              <div class="flex items-center gap-2" data-testid="editor-word">
                <Checkbox onChange={checked => onWordToggled(word, checked)} />
                <span>{word.original}</span>
                <span class="mx-2 text-center">-</span>
                <span>{word.translation}</span>
                <HiOutlinePencil
                  class="mt-1 opacity-50 cursor-pointer hover:opacity-80"
                  title="Edit word"
                  onClick={() => setWordDetailToOpen(word)}
                />
              </div>
            </>
          )}
        </For>
      </div>
    </>
  );
};

export default VocabularyEditor;
