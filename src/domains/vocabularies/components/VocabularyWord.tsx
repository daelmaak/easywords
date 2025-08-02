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
import { cx } from 'class-variance-authority';
import type { VocabularyWordsBlurState } from '../model/vocabulary-state';
import type { CountryCode } from '../model/countries';

interface Props {
  word: Word;
  selected?: boolean;
  blurState?: VocabularyWordsBlurState;
  vocabularyLang: CountryCode;
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
        aria-label="Select word"
        class="h-8 -translate-y-1 self-start"
        checked={props.selected}
        id={`word-selector-${props.word.id}`}
        onClick={(e: MouseEvent) => onSelected(e)}
        // Prevents text selection when shift clicking
        onMouseDown={(e: MouseEvent) => e.preventDefault()}
      />

      <div class="flex grow flex-wrap justify-between">
        <div class="flex flex-col">
          <div
            class={cx('flex gap-x-1', {
              'text-neutral-600': props.word.archived,
            })}
          >
            <dt
              lang={props.vocabularyLang}
              class={cx({ 'blur-sm': props.blurState?.original })}
            >
              {props.word.original}
            </dt>
            <span aria-hidden="true" class="mx-2 text-center">
              -
            </span>
            <dd class={cx({ 'blur-sm': props.blurState?.translation })}>
              {props.word.translation}
            </dd>
            <Show when={props.word.archived}>
              <span class="ml-2 text-sm">(archived)</span>
            </Show>
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
          <TooltipTrigger aria-hidden="true" class="ml-auto" tabindex="-1">
            <LifeLine results={props.word.results} class="h-6 w-28" />
          </TooltipTrigger>
          <TooltipContent>
            Testing frequency for the last 30 days
          </TooltipContent>
        </Tooltip>
      </div>

      <HiOutlineChevronRight
        aria-label="Open word details"
        class="ml-2 text-neutral-500 md:ml-4"
      />
    </div>
  );
};
