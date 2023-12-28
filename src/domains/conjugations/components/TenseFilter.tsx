import { Component, For } from 'solid-js';
import { Checkbox } from '../../../components/Checkbox';
import { ConjugationsByMood } from '../conjugation';

interface Props {
  conjugationsByMood: ConjugationsByMood;
  selectedTenses: string[];
  onChange(tenses: string[]): void;
}

export const TenseFilter: Component<Props> = props => {
  const onSelected = (tense: string, checked: boolean) => {
    if (checked) {
      props.onChange(props.selectedTenses.concat(tense));
    } else {
      props.onChange(props.selectedTenses.filter(t => t !== tense));
    }
  };

  return (
    <div>
      <For each={Object.entries(props.conjugationsByMood)}>
        {([mood, conjugationsByTense]) => (
          <div>
            <div class="text-lg">{mood}</div>
            <For each={conjugationsByTense}>
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
