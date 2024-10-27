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

export type VocabularyWordsSorterProps = {
  sort: (sortProps: Partial<SortState>) => void;
};

export const VocabularyWordsSorter: Component<
  VocabularyWordsSorterProps
> = props => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button class="px-2 font-normal" variant="ghost">
        <HiOutlineArrowsUpDown class="size-4" /> Sort
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
    </DropdownMenuContent>
  </DropdownMenu>
);
