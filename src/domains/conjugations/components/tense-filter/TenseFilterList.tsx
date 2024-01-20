import { Component, createSignal, For, Show } from 'solid-js';
import { Checkbox } from '../../../../components/Checkbox';
import { Lang } from '../../../../model/lang';
import { capitalizeFirstLetter } from '../../../../util/string';
import { removeMoodFromTense } from '../../conjugation';
import { sortTenses } from '../../tenses-priority';

interface Props {
  lang: Lang;
  mood: string;
  selectedTenses: string[];
  tenses: string[];
  onSelected(tenses: string[]): void;
}

export const TenseFilterList: Component<Props> = props => {
  const [expanded, setExpanded] = createSignal(false);

  const sortedTenses = () =>
    sortTenses(
      props.lang,
      props.mood,
      expanded() ? props.tenses : props.tenses.slice(0, 4)
    );

  const onSelected = (tense: string, checked: boolean) => {
    if (checked) {
      props.onSelected(props.selectedTenses.concat(tense));
    } else {
      props.onSelected(props.selectedTenses.filter(t => t !== tense));
    }
  };

  return (
    <div>
      <div class="text-md">{props.mood}</div>
      <ul class="flex flex-wrap">
        <For each={sortedTenses()}>
          {tense => (
            <li>
              <Checkbox
                id={tense}
                checked={props.selectedTenses.includes(tense)}
                label={capitalizeFirstLetter(
                  removeMoodFromTense(tense, props.mood)
                )}
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
    </div>
  );
};
