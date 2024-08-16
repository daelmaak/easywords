import { Show, type Component } from 'solid-js';
import { Dialog, DialogContent, DialogHeader } from '~/components/ui/dialog';
import { WordEditor } from './WordEditor';
import type { Word } from '../model/vocabulary-model';

interface WordEditorDialogProps {
  word?: Word;
  open: boolean;
  onClose: () => void;
  onWordEdited: (word: Word) => void;
}

export const WordEditorDialog: Component<WordEditorDialogProps> = props => {
  return (
    <Dialog open={props.open} onOpenChange={props.onClose}>
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
