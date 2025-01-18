import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { Checkbox } from '~/components/ui/checkbox';
import type { Tense } from '../../resources/conjugations-api';

interface Props {
  selectedTenses: Tense[];
  tenses: Tense[];
  onSelected(tenses: Tense[]): void;
}

export const TenseFilterList: Component<Props> = props => {
  const [expanded, setExpanded] = createSignal(false);

  const currentTenses = () =>
    expanded() ? props.tenses : props.tenses.slice(0, 4);

  const isSelected = (tense: Tense) =>
    props.selectedTenses.map(t => t.name).includes(tense.name);

  const onSelected = (tense: Tense, checked: boolean) => {
    if (checked) {
      props.onSelected(props.selectedTenses.concat(tense));
    } else {
      props.onSelected(props.selectedTenses.filter(t => t.name !== tense.name));
    }
  };

  return (
    <ul class="flex flex-wrap">
      <For each={currentTenses()}>
        {tense => (
          <li>
            <Checkbox
              id={tense.name}
              checked={isSelected(tense)}
              label={tense.name}
              onChange={checked => onSelected(tense, checked)}
            />
          </li>
        )}
      </For>
      <Show when={props.tenses.length > 4}>
        <li class="flex px-6">
          <button class="btn-link" onClick={() => setExpanded(!expanded())}>
            {expanded() ? 'Show less' : 'Show more'}
          </button>
        </li>
      </Show>
    </ul>
  );
};
