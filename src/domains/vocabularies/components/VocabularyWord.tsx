import { Show, type Component } from 'solid-js';
import { Checkbox } from '../../../components/ui/checkbox';
import type { Word } from '../model/vocabulary-model';
import { LifeLine } from '~/components/LifeLine';
import {
  HiOutlineAcademicCap,
  HiOutlineChartBar,
  HiOutlineChevronRight,
  HiOutlinePlus,
} from 'solid-icons/hi';
import {
  TooltipTrigger,
  TooltipContent,
  Tooltip,
} from '~/components/ui/tooltip';

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
      class="flex cursor-pointer items-center gap-1 py-1 pr-2"
      onClick={() => props.onWordDetailToOpen(props.word)}
    >
      <Checkbox
        class="mt-1 self-start"
        checked={props.selected}
        id={`word-selector-${props.word.id}`}
        onClick={(e: MouseEvent) => onSelected(e)}
        // Prevents text selection when shift clicking
        onMouseDown={(e: MouseEvent) => e.preventDefault()}
      />

      <div class="flex grow flex-col">
        <div class="flex items-center gap-x-1">
          <span>{props.word.original}</span>
          <span class="mx-2 text-center">-</span>
          <span>{props.word.translation}</span>
        </div>
        <div class="flex gap-4 pr-4 text-xs text-neutral-400">
          <span class="inline-flex items-center gap-1">
            <HiOutlinePlus size={14} />
            {props.word.createdAt.toLocaleDateString(undefined, dateOptions)}
          </span>
          <Show when={props.word.lastTestDate}>
            {lastTestDate => (
              <span class="inline-flex items-center gap-1">
                <HiOutlineAcademicCap size={14} />
                {lastTestDate().toLocaleDateString(undefined, dateOptions)}
              </span>
            )}
          </Show>
          <Show when={props.word.averageTestScore != null}>
            <span class="inline-flex items-center gap-1">
              <HiOutlineChartBar size={14} />
              {props.word.averageTestScore!.toFixed(0)}%
            </span>
          </Show>
        </div>
      </div>

      <Tooltip openDelay={300} closeDelay={0}>
        <TooltipTrigger tabindex="-1">
          <LifeLine
            results={props.word.results}
            class="hidden h-6 w-28 sm:block"
          />
        </TooltipTrigger>
        <TooltipContent>Testing frequency for the last 30 days</TooltipContent>
      </Tooltip>

      <HiOutlineChevronRight class="ml-4 text-neutral-500" />
    </div>
  );
};
