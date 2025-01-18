import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { Checkbox } from '~/components/ui/checkbox';
import type { Tense } from '../../resources/conjugations-api';
import { Button } from '~/components/ui/button';

interface Props {
  selectedTenses: Tense[];
  tenses: Tense[];
  onSelectedTenses(tenses: Tense[]): void;
}

export const TenseFilter: Component<Props> = props => {
  const [expanded, setExpanded] = createSignal(false);

  const isSelected = (tense: Tense) =>
    props.selectedTenses.map(t => t.name).includes(tense.name);

  const onSelected = (tense: Tense, checked: boolean) => {
    if (checked) {
      props.onSelectedTenses(props.selectedTenses.concat(tense));
    } else {
      props.onSelectedTenses(
        props.selectedTenses.filter(t => t.name !== tense.name)
      );
    }
  };

  // Groups tenses by the first word in their name
  const groupedTenses = () => {
    const acc = new Map<string, Tense[]>();
    props.tenses.forEach(tense => {
      const firstWord = tense.name.split(' ')[0];
      if (!acc.has(firstWord)) {
        acc.set(firstWord, []);
      }
      acc.get(firstWord)?.push(tense);
    });
    return acc;
  };

  const currentTenses = () => {
    const grouped = groupedTenses().entries();
    return expanded() ? grouped.toArray() : grouped.take(4).toArray();
  };

  const terserName = (tense: Tense) => {
    const words = tense.name.split(' ');
    return words.length > 1 ? words.slice(1).join(' ') : words[0];
  };

  return (
    <div>
      <For each={currentTenses()}>
        {([firstWord, tenses]) => (
          <div class="mb-2">
            <h3 class="font-semibold">{firstWord}</h3>
            <ul class="flex flex-wrap">
              <For each={tenses}>
                {tense => (
                  <li>
                    <Checkbox
                      id={tense.name}
                      checked={isSelected(tense)}
                      label={terserName(tense)}
                      onChange={checked => onSelected(tense, checked)}
                    />
                  </li>
                )}
              </For>
            </ul>
          </div>
        )}
      </For>
      <Show when={props.tenses.length > 4}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setExpanded(!expanded())}
        >
          {expanded() ? 'Show less' : 'Show more'}
        </Button>
      </Show>
    </div>
  );
};
