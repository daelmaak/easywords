import type { Component } from 'solid-js';
import { TenseFilterList } from './TenseFilterList';
import type { Tense } from '../../resources/conjugations-api';

interface Props {
  tenses: Tense[];
  selectedTenses: Tense[];
  onSelectedTenses(tenses: Tense[]): void;
}

export const TenseFilter: Component<Props> = props => {
  return (
    <div class="flex w-[min(640px,100%)] flex-col items-center">
      <TenseFilterList
        tenses={props.tenses}
        selectedTenses={props.selectedTenses}
        onSelected={props.onSelectedTenses}
      />
    </div>
  );
};
