import { HiOutlineArrowsUpDown, HiOutlineCheck } from 'solid-icons/hi';
import { createSignal, For, type Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  DropdownMenuContent,
  DropdownMenu,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import type { SortState } from './VocabularyWords';
import { Checkbox } from '~/components/ui/checkbox';
import { cx } from 'class-variance-authority';

const SortKeyCopy: Partial<Record<SortState['by'], string>> = {
  createdAt: 'Date added',
  lastTestDate: 'Last tested',
  testCount: 'Most tested',
  averageTestScore: 'Average test score',
  original: 'Original',
  translation: 'Translation',
  archived: 'Archived',
};

export type VocabularyWordsSorterProps = {
  sortState: SortState;
  displayArchived: boolean;
  sort: (sortProps: Partial<SortState>) => void;
};

export const VocabularyWordsSorter: Component<
  VocabularyWordsSorterProps
> = props => {
  const [open, setOpen] = createSignal(false);
  const [stagedSortState, setStagedSortState] = createSignal<SortState>();

  const currentKey = () => stagedSortState()?.by ?? props.sortState.by;

  const sortKeys = () =>
    props.displayArchived
      ? Object.keys(SortKeyCopy)
      : Object.keys(SortKeyCopy).filter(
          k => (k as keyof typeof SortKeyCopy) !== 'archived'
        );

  const handleSort = (sortProps: Partial<SortState>) => {
    setStagedSortState({
      ...props.sortState,
      ...stagedSortState(),
      ...sortProps,
    });
  };

  const sort = () => {
    setOpen(false);

    const staged = stagedSortState();

    if (staged) {
      props.sort(staged);
    }
  };

  return (
    <DropdownMenu open={open()} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        as={(p: object) => (
          <Button
            {...p}
            class="size-8 px-2 font-normal sm:size-auto lg:size-8 xl:size-auto"
            size="icon"
            variant="ghost"
            onClick={() => setOpen(true)}
          >
            <span
              class={cx(
                'relative after:absolute after:top-0 after:h-full after:w-1/2 after:bg-background after:opacity-65',
                props.sortState.asc ? 'after:right-0' : 'after:left-0'
              )}
            >
              <HiOutlineArrowsUpDown size={17} />{' '}
            </span>
            <span class="hidden sm:inline lg:hidden xl:inline">
              {SortKeyCopy[props.sortState.by]
                ? `by: ${SortKeyCopy[props.sortState.by]}`
                : 'Sort'}
            </span>
          </Button>
        )}
      ></DropdownMenuTrigger>
      <DropdownMenuContent class="p-2">
        <div class="flex items-center gap-2 border-b pb-2">
          <Checkbox
            class="text-sm"
            defaultChecked={props.sortState.asc}
            label="Ascending"
            onChange={() => handleSort({ asc: !props.sortState.asc })}
          />
        </div>
        <div class="mt-2 flex flex-col gap-1">
          <For each={sortKeys()}>
            {key => (
              <SortItem
                sortKey={key as SortState['by']}
                selected={currentKey() === key}
                sort={handleSort}
              />
            )}
          </For>

          <Button size="sm" onClick={sort}>
            Apply
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SortItem: Component<{
  sortKey: SortState['by'];
  selected: boolean;
  sort: (sortProps: Partial<SortState>) => void;
}> = props => {
  return (
    <Button
      class="justify-start"
      variant="ghost"
      onClick={() => props.sort({ by: props.sortKey })}
    >
      <HiOutlineCheck
        size={16}
        class={props.selected ? 'visible' : 'invisible'}
      />
      {SortKeyCopy[props.sortKey]}
    </Button>
  );
};
