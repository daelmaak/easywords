import type { Component} from 'solid-js';
import { For } from 'solid-js';
import { Badge } from '~/components/ui/badge';

interface ChipsProps {
  chips: string[];
  selectedChips: string[];
  onChipsSelected(selectedChips: string[]): void;
}

export const Chips: Component<ChipsProps> = props => {
  const toggleChip = (chip: string, selected: boolean) => {
    if (selected) {
      props.onChipsSelected(props.selectedChips.concat(chip));
    } else {
      props.onChipsSelected(props.selectedChips.filter(c => c !== chip));
    }
  };

  return (
    <ul class="flex flex-wrap gap-2">
      <For each={props.chips}>
        {chip => {
          return (
            <Chip
              chip={chip}
              selected={props.selectedChips.includes(chip)}
              onToggled={selected => toggleChip(chip, selected)}
            />
          );
        }}
      </For>
    </ul>
  );
};

interface ChipProps {
  chip: string;
  selected: boolean;
  onToggled: (selected: boolean) => void;
}

const Chip: Component<ChipProps> = props => (
  <Badge
    class="cursor-pointer"
    variant={props.selected ? 'default' : 'secondary'}
    onClick={() => props.onToggled(!props.selected)}
  >
    <button class="px-3 py-1" type="button">
      {props.chip}
    </button>
  </Badge>
);
