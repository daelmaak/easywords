import { cx } from 'class-variance-authority';
import { HiOutlineAcademicCap, HiOutlineChevronDown } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { Search } from '~/components/search/Search';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import type { Word } from '../../model/vocabulary-model';
import type { SortState } from '../VocabularyWords';
import { VocabularyWordsSorter } from '../VocabularyWordsSorter';
import type { VocabularyWordsBlurState } from '../../model/vocabulary-state';
import { VocabularyWordsToolbarOptions } from './VocabularyWordsToolbarOptions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface Props {
  words?: Word[];
  blurState: VocabularyWordsBlurState;
  displayArchived: boolean;
  selectedWords: Word[];
  sortState: SortState;
  onSearch: (words: Word[] | undefined) => void;
  onSelectAll: (selected: boolean) => void;
  onSelectNext: (amount: number) => void;
  onSort: (sortProps: Partial<SortState>) => void;
  onTestSelected: () => void;
  onToggleDisplayArchived: () => void;
  onBlurStateChange: (blurState: VocabularyWordsBlurState) => void;
}

export const VocabularyWordsToolbar: Component<Props> = props => {
  function onToggleBlur(field?: keyof Pick<Word, 'original' | 'translation'>) {
    if (field) {
      props.onBlurStateChange({
        ...props.blurState,
        [field]: !props.blurState[field],
      });
    } else {
      const blur = !props.blurState.original && !props.blurState.translation;
      props.onBlurStateChange({
        original: blur,
        translation: blur,
      });
    }
  }

  return (
    <div class="flex flex-wrap items-center gap-1 border-b border-neutral-100 px-1 pb-2 pt-1 text-sm md:px-2 lg:gap-2">
      <Show when={props.selectedWords}>
        <span class="inline-flex items-center">
          <Checkbox
            checked={props.selectedWords.length === (props.words?.length ?? 0)}
            indeterminate={
              props.selectedWords.length > 0 &&
              props.selectedWords.length < (props.words?.length ?? 0)
            }
            onChange={() => props.onSelectAll(props.selectedWords.length === 0)}
          />
          <DropdownMenu>
            <DropdownMenuTrigger
              as={(p: object) => (
                <Button
                  class="size-8 md:hidden"
                  size="icon"
                  variant="ghost"
                  {...p}
                >
                  <HiOutlineChevronDown />
                </Button>
              )}
            />
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => props.onSelectNext(10)}>
                Select next 10 words
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      </Show>
      <VocabularyWordsSorter
        displayArchived={props.displayArchived}
        sortState={props.sortState}
        sort={props.onSort}
      />
      <Show when={props.words}>
        {w => (
          <Search
            class="h-8 w-36 py-0"
            placeholder="Search words..."
            terms={w()}
            searchKeys={['original', 'translation']}
            onSearch={props.onSearch}
          />
        )}
      </Show>
      <Button
        class={cx('px-2', {
          'hidden lg:invisible lg:inline': props.selectedWords.length === 0,
        })}
        size="sm"
        variant="default"
        onClick={props.onTestSelected}
      >
        <HiOutlineAcademicCap /> Test{' '}
        <span class="self-center text-xs">({props.selectedWords.length})</span>
      </Button>

      <VocabularyWordsToolbarOptions
        displayArchived={props.displayArchived}
        blurState={props.blurState}
        onToggleDisplayArchived={props.onToggleDisplayArchived}
        onToggleBlur={onToggleBlur}
      />
    </div>
  );
};
