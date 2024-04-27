import { Component, For } from 'solid-js';
import { ConjugationLang } from '../../../../model/lang';
import { ConjugationsByMood } from '../../conjugation';
import { Chips } from '../Chips';
import { TenseFilterList } from './TenseFilterList';

interface Props {
  conjugationsByMood: ConjugationsByMood;
  lang: ConjugationLang;
  selectedMoods: string[];
  selectedTenses: string[];
  onSelectedTenses(tenses: string[]): void;
  onSelectedMoods(moods: string[]): void;
}

export const TenseFilter: Component<Props> = props => {
  const moods = () => Object.keys(props.conjugationsByMood);
  const tenses = (mood: string) =>
    props.conjugationsByMood[mood].map(c => c.tense);

  return (
    <div class="w-[min(640px,100%)] flex flex-col items-center">
      <Chips
        chips={moods()}
        selectedChips={props.selectedMoods}
        onChipsSelected={props.onSelectedMoods}
      />
      <div class="mt-4"></div>
      <div class="w-full">
        <For each={props.selectedMoods}>
          {mood => (
            <TenseFilterList
              mood={mood}
              lang={props.lang}
              tenses={tenses(mood)}
              selectedTenses={props.selectedTenses}
              onSelected={props.onSelectedTenses}
            />
          )}
        </For>
      </div>
    </div>
  );
};
