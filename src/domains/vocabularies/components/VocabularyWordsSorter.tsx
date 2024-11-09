import { HiOutlineArrowsUpDown } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenu,
} from '~/components/ui/dropdown-menu';
import type { SortState } from './VocabularyWords';

const SortKeyCopy: Partial<Record<SortState['by'], string>> = {
  createdAt: 'Date created',
  original: 'Original',
  translation: 'Translation',
  latestTestDate: 'Date tested',
};

export type VocabularyWordsSorterProps = {
  sortState: SortState;
  sort: (sortProps: Partial<SortState>) => void;
};

export const VocabularyWordsSorter: Component<
  VocabularyWordsSorterProps
> = props => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button class="px-2 font-normal" variant="ghost">
          <HiOutlineArrowsUpDown class="size-4" />{' '}
          {SortKeyCopy[props.sortState.by]
            ? `by: ${SortKeyCopy[props.sortState.by]}`
            : 'Sort'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent class="p-4">
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'createdAt', asc: true })}
        >
          Oldest to newest
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'createdAt', asc: false })}
        >
          Newest to oldest
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'original', asc: true })}
        >
          Original (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'original', asc: false })}
        >
          Original (Z-A)
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'translation', asc: true })}
        >
          Translation (A-Z)
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'translation', asc: false })}
        >
          Translation (Z-A)
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'latestTestDate', asc: false })}
        >
          Tested (newest first)
        </DropdownMenuItem>
        <DropdownMenuItem
          as="button"
          class="text-base"
          onClick={() => props.sort({ by: 'latestTestDate', asc: true })}
        >
          Tested (oldest first)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
