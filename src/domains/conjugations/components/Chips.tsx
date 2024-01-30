import { Component, For } from 'solid-js';

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
    <ul class="flex flex-wrap gap-3">
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
  <li
    class="rounded-lg text-sm cursor-pointer"
    classList={{
      'bg-zinc-700 text-zinc-300': !props.selected,
      'font-semibold text-zinc-900 bg-violet-500': props.selected,
    }}
    onClick={() => props.onToggled(!props.selected)}
  >
    <button class="px-3 py-1" type="button">
      {props.chip}
    </button>
  </li>
);
