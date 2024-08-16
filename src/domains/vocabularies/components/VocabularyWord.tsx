import { HiOutlinePencil, HiSolidInformationCircle } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from '../../../components/ui/popover';
import { Checkbox } from '../../../components/ui/checkbox';
import type { Word } from '../model/vocabulary-model';
import { Button } from '~/components/ui/button';

interface Props {
  word: Word;
  selected?: boolean;
  onWordSelected: (
    word: Word,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) => void;
  onWordDetailToOpen: (word: Word) => void;
}

export const VocabularyWord: Component<Props> = props => {
  function onClick(e: MouseEvent) {
    props.onWordSelected(props.word, !props.selected, {
      shiftSelection: e.shiftKey,
    });
  }

  return (
    <div class="flex items-center gap-1" data-testid="editor-word">
      <Checkbox
        checked={props.selected}
        id={`word-selector-${props.word.id}`}
        onClick={(e: MouseEvent) => onClick(e)}
        // Prevents text selection when shift clicking
        onMouseDown={(e: MouseEvent) => e.preventDefault()}
      />
      <span>{props.word.original}</span>
      <span class="mx-2 text-center">-</span>
      <span>{props.word.translation}</span>
      <Button
        class="mt-1 p-0 size-8 opacity-50 hover:opacity-80"
        title="Edit word"
        variant="ghost"
        onClick={() => props.onWordDetailToOpen(props.word)}
      >
        <HiOutlinePencil />
      </Button>

      <Show when={props.word.notes}>
        <Popover>
          <PopoverTrigger>
            <Button
              class="mt-1 p-0 size-8 text-blue-600 hover:text-blue-900"
              variant="ghost"
            >
              <HiSolidInformationCircle size={20} title="Show notes" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>{props.word.notes}</PopoverContent>
        </Popover>
      </Show>
    </div>
  );
};
