import { Component, For, createSignal } from 'solid-js';
import { Checkbox } from '../../../components/Checkbox';
import { Lang } from '../../../model/lang';
import { ConjugationsByMood } from '../conjugation';
import { sortTenses } from '../tenses-priority';
import { Chips } from './Chips';

interface Props {
  conjugationsByMood: ConjugationsByMood;
  lang: Lang;
  selectedTenses: string[];
  onChange(tenses: string[]): void;
}

export const TenseFilter: Component<Props> = props => {
  const [selectedMoods, setSelectedMoods] = createSignal<string[]>([]);

  const moods = () => Object.keys(props.conjugationsByMood);
  const tenses = (mood: string) =>
    props.conjugationsByMood[mood].map(c => c.tense);
  const sortedTenses = (mood: string) =>
    sortTenses(props.lang, mood, tenses(mood));

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
            <For each={sortedTenses(mood)}>
              {tense => (
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
