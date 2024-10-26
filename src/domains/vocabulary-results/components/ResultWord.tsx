import { HiOutlinePencil } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';

interface ResultWordProps {
  word: Word;
  onEditWord: () => void;
}

export const ResultWord: Component<ResultWordProps> = props => {
  return (
    <div class="flex items-center gap-2" data-testid="editor-word">
      <span>{props.word.original}</span>
      <span class="mx-2 text-center">-</span>
      <span>{props.word.translation}</span>
      <Button
        class="mt-1 size-8 p-0 opacity-50 hover:opacity-80"
        title="Edit word"
        variant="ghost"
        onClick={props.onEditWord}
      >
        <HiOutlinePencil />
      </Button>
    </div>
  );
};
