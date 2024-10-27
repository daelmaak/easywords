import type { Component } from 'solid-js';
import { Checkbox } from '../../../components/ui/checkbox';
import type { Word } from '../model/vocabulary-model';

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

const dateOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
};

export const VocabularyWord: Component<Props> = props => {
  function onSelected(e: MouseEvent) {
    e.stopPropagation();
    props.onWordSelected(props.word, !props.selected, {
      shiftSelection: e.shiftKey,
    });
  }

  return (
    <div
      class="flex cursor-pointer items-center gap-1 py-2"
      onClick={() => props.onWordDetailToOpen(props.word)}
    >
      <Checkbox
        checked={props.selected}
        id={`word-selector-${props.word.id}`}
        onClick={(e: MouseEvent) => onSelected(e)}
        // Prevents text selection when shift clicking
        onMouseDown={(e: MouseEvent) => e.preventDefault()}
      />
      <span>{props.word.original}</span>
      <span class="mx-2 text-center">-</span>
      <span>{props.word.translation}</span>

      <span class="ml-auto inline-flex items-center gap-1 md:gap-2">
        <span class="ml-2 text-right text-xs text-neutral-500">
          {props.word.createdAt.toLocaleDateString(undefined, dateOptions)}
        </span>
      </span>
    </div>
  );
};
