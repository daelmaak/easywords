import { HiOutlineEllipsisVertical } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuGroupLabel,
  DropdownMenu,
} from '~/components/ui/dropdown-menu';

interface VocabularyWordsToolbarOptionsProps {
  displayArchived: boolean;
  onToggleDisplayArchived: () => void;
  blurState: {
    original: boolean;
    translation: boolean;
  };
  onToggleBlur: (type: 'original' | 'translation') => void;
}

export const VocabularyWordsToolbarOptions: Component<
  VocabularyWordsToolbarOptionsProps
> = props => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        as={(p: object) => (
          <Button {...p} class="ml-auto size-8" size="icon" variant="ghost">
            <HiOutlineEllipsisVertical size={20} />
          </Button>
        )}
      />
      <DropdownMenuContent>
        <DropdownMenuItem>
          <Checkbox
            checked={props.displayArchived}
            label="Show archived"
            onChange={props.onToggleDisplayArchived}
          />
        </DropdownMenuItem>
        <DropdownMenuGroup>
          <DropdownMenuGroupLabel>Blur</DropdownMenuGroupLabel>
          <DropdownMenuItem>
            <Checkbox
              checked={props.blurState.original}
              label="Original"
              onChange={() => props.onToggleBlur('original')}
            />
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Checkbox
              checked={props.blurState.translation}
              label="Translation"
              onChange={() => props.onToggleBlur('translation')}
            />
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
