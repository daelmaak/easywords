import { HiOutlinePencil, HiSolidInformationCircle } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from '../../../components/ui/popover';
import { Checkbox } from '../../../components/ui/checkbox';
import type { VocabularyItem } from '../model/vocabulary-model';

interface Props {
  word: VocabularyItem;
  selected?: boolean;
  onWordSelected: (
    word: VocabularyItem,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) => void;
  onWordDetailToOpen: (word: VocabularyItem) => void;
}

export const VocabularyWord: Component<Props> = props => {
  function onClick(e: MouseEvent) {
    props.onWordSelected(props.word, !props.selected, {
      shiftSelection: e.shiftKey,
    });
  }

  return (
    <div class="flex items-center gap-2" data-testid="editor-word">
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
      <HiOutlinePencil
        class="mt-1 opacity-50 cursor-pointer hover:opacity-80"
        title="Edit word"
        onClick={() => props.onWordDetailToOpen(props.word)}
      />
      <Show when={props.word.notes}>
        <Popover>
          <PopoverTrigger>
            <HiSolidInformationCircle
              class="mt-1 text-blue-600 hover:text-blue-900"
              size={20}
              title="Show notes"
            />
          </PopoverTrigger>
          <PopoverContent>{props.word.notes}</PopoverContent>
        </Popover>
      </Show>
    </div>
  );
};
