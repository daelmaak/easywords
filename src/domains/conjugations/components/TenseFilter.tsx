import { Component, For, createSignal } from 'solid-js';
import { Checkbox } from '../../../components/Checkbox';
import { ConjugationsByMood } from '../conjugation';
import { Chips } from './Chips';

interface Props {
  conjugationsByMood: ConjugationsByMood;
  selectedTenses: string[];
  onChange(tenses: string[]): void;
}

export const TenseFilter: Component<Props> = props => {
  const [selectedMoods, setSelectedMoods] = createSignal<string[]>([]);

  const moods = () => Object.keys(props.conjugationsByMood);

  const onSelected = (tense: string, checked: boolean) => {
    if (checked) {
      props.onChange(props.selectedTenses.concat(tense));
    } else {
      props.onChange(props.selectedTenses.filter(t => t !== tense));
    }
  };

  return (
    <div class="flex flex-col items-center">
      <Chips
        chips={moods()}
        selectedChips={selectedMoods()}
        onChipsSelected={setSelectedMoods}
      />
      <div class="mt-4"></div>
      <For each={selectedMoods()}>
        {mood => (
          <div>
            <div class="text-lg">{mood}</div>
            <For each={props.conjugationsByMood[mood]}>
              {({ tense }) => (
                <Checkbox
                  id={tense}
                  label={tense}
                  onChange={checked => onSelected(tense, checked)}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
};
