import { HiSolidPlus } from 'solid-icons/hi';
import { Component, ResourceReturn, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import { VocabularyList } from '../../vocabulary-model';
import { VocabularyListCreator } from './VocabularyListCreator';

interface Props {
  fetchVocabulary: ResourceReturn<VocabularyList[]>;
}

interface State {
  showCreator: boolean;
}

export const VocabularyListManager: Component<Props> = props => {
  const [vocabularyLists] = props.fetchVocabulary;
  const [state, setState] = createStore<State>({
    showCreator: false,
  });

  const noLists = () => !vocabularyLists()?.length;

  return (
    <>
      <Show when={noLists() && !state.showCreator}>
        <div
          class="flex flex-col items-center gap-4"
          data-testid="empty-vocabulary-list"
        >
          <h2 class="text-xl text-center">Create your first vocabulary!</h2>
          <Button type="button" onClick={() => setState('showCreator', true)}>
            <HiSolidPlus size={20} />
            Create
          </Button>
        </div>
      </Show>
      <Show when={state.showCreator}>
        <VocabularyListCreator />
      </Show>
    </>
  );
};
