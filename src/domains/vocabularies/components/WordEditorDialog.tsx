import { Show, type Component } from 'solid-js';
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog';
import { WordEditor } from './WordEditor';
import type { VocabularyItem } from '../model/vocabulary-model';

interface WordEditorDialogProps {
  word?: VocabularyItem;
  onClose: () => void;
  onWordEdited: (word: VocabularyItem) => void;
}

export const WordEditorDialog: Component<WordEditorDialogProps> = props => {
  return (
    <Dialog open={props.word != null} onOpenChange={props.onClose}>
      <DialogContent>
        <DialogHeader>
          <h2 class="text-lg font-bold">Edit word</h2>
        </DialogHeader>
        <Show when={props.word}>
          {w => <WordEditor word={w()} onChange={props.onWordEdited} />}
        </Show>
      </DialogContent>
    </Dialog>
  );
};
