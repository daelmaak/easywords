import { cx } from 'class-variance-authority';
import {
  HiOutlineAcademicCap,
  HiOutlineEllipsisVertical,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show } from 'solid-js';
import { Search } from '~/components/search/Search';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import type { Word } from '../model/vocabulary-model';
import type { SortState } from './VocabularyWords';
import { VocabularyWordsSorter } from './VocabularyWordsSorter';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

interface Props {
  words?: Word[];
  displayArchived: boolean;
  selectedWords: Word[];
  sortState: SortState;
  onSearch: (words: Word[] | undefined) => void;
  onSelectAll: (selected: boolean) => void;
  onSort: (sortProps: Partial<SortState>) => void;
  onTestSelected: () => void;
  onDeleteSelected: () => void;
  onToggleDisplayArchived: () => void;
}

export const VocabularyWordsToolbar: Component<Props> = props => {
  return (
    <div class="flex flex-wrap items-center gap-1 border-b border-neutral-100 px-2 pb-2 pt-1 text-sm lg:gap-2">
      <Show when={props.selectedWords}>
        <Checkbox
          checked={props.selectedWords.length === (props.words?.length ?? 0)}
          indeterminate={
            props.selectedWords.length > 0 &&
            props.selectedWords.length < (props.words?.length ?? 0)
          }
          onChange={() => props.onSelectAll(props.selectedWords.length === 0)}
        />
      </Show>
      <VocabularyWordsSorter
        displayArchived={props.displayArchived}
        sortState={props.sortState}
        sort={props.onSort}
      />
      <Show when={props.words}>
        {w => (
          <Search
            class="h-8 w-40 py-0"
            placeholder="Search words..."
            terms={w()}
            searchKeys={['original', 'translation']}
            onSearch={props.onSearch}
          />
        )}
      </Show>
      <Button
        class={cx({
          'hidden lg:invisible lg:inline': props.selectedWords.length === 0,
        })}
        size="sm"
        variant="default"
        onClick={props.onTestSelected}
      >
        <HiOutlineAcademicCap /> Test
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          as={(p: object) => (
            <Button {...p} class="ml-auto" size="icon" variant="ghost">
              <HiOutlineEllipsisVertical size={20} />
            </Button>
          )}
        ></DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Checkbox
              checked={props.displayArchived}
              label="Show archived"
              onChange={() => props.onToggleDisplayArchived()}
            />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
