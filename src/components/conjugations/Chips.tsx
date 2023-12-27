import { Component, For, createSignal } from 'solid-js';

interface ChipsProps {
  chips: string[];
  onChipsSelected(chips: string[]): void;
}

export const Chips: Component<ChipsProps> = props => {
  const [selectedChips] = createSignal<string[]>([]);

  const chipSelections = () =>
    props.chips.map(chip => ({
      chip,
      selected: selectedChips().includes(chip),
    }));

  return (
    <ul class="flex flex-wrap gap-3">
      <For each={chipSelections()}>
        {item => <Chip chip={item.chip} selected={item.selected} />}
      </For>
    </ul>
  );
};

interface ChipProps {
  chip: string;
  selected: boolean;
}

const Chip: Component<ChipProps> = props => (
  <li class="px-3 py-1 border border-solid rounded-lg border-zinc-400 text-sm text-zinc-300">
    {props.chip}
  </li>
);
