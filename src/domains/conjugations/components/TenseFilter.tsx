import { Component, For } from 'solid-js';
import { Checkbox } from '../../../components/Checkbox';
import { Lang } from '../../../model/lang';
import { capitalizeFirstLetter } from '../../../util/string';
import { ConjugationsByMood, removeMoodFromTense } from '../conjugation';
import { sortTenses } from '../tenses-priority';
import { Chips } from './Chips';

interface Props {
  conjugationsByMood: ConjugationsByMood;
  lang: Lang;
  selectedMoods: string[];
  selectedTenses: string[];
  onSelectedTenses(tenses: string[]): void;
  onSelectedMoods(moods: string[]): void;
}

export const TenseFilter: Component<Props> = props => {
  const moods = () => Object.keys(props.conjugationsByMood);
  const tenses = (mood: string) =>
    props.conjugationsByMood[mood].map(c => c.tense);
  const sortedTenses = (mood: string) =>
    sortTenses(props.lang, mood, tenses(mood));

  const onSelected = (tense: string, checked: boolean) => {
    if (checked) {
      props.onSelectedTenses(props.selectedTenses.concat(tense));
    } else {
      props.onSelectedTenses(props.selectedTenses.filter(t => t !== tense));
    }
  };

  return (
    <div class="flex flex-col items-center">
      <Chips
        chips={moods()}
        selectedChips={props.selectedMoods}
        onChipsSelected={props.onSelectedMoods}
      />
      <div class="mt-4"></div>
      <For each={props.selectedMoods}>
        {mood => (
          <div>
            <div class="text-lg">{mood}</div>
            <For each={sortedTenses(mood)}>
              {tense => (
                <Checkbox
                  id={tense}
                  label={capitalizeFirstLetter(
                    removeMoodFromTense(tense, mood)
                  )}
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
