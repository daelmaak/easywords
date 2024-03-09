import { HiSolidPlus } from 'solid-icons/hi';
import { Component, ResourceReturn, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import { WordTranslation } from '~/model/word-translation';
import { VocabularyList } from '../../vocabulary-model';
import { VocabularyCreator } from './VocabularyCreator';
import { Skeleton } from '~/components/ui/skeleton';

interface Props {
  createVocabulary: (
    name: string,
    words: WordTranslation[]
  ) => Promise<boolean>;
  fetchVocabulary: ResourceReturn<VocabularyList[]>;
}

interface State {
  showCreator: boolean;
}

export const VocabularyManager: Component<Props> = props => {
  const [vocabularyLists] = props.fetchVocabulary;
  const [state, setState] = createStore<State>({
    showCreator: false,
  });

  const loading = () => vocabularyLists() == null;
  const noLists = () => !vocabularyLists()?.length;

  async function createList(name: string, words: WordTranslation[]) {
    const success = await props.createVocabulary(name, words);

    if (success) {
      setState('showCreator', false);
    }
  }

  return (
    <>
      <Show when={!loading()}>
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
          <VocabularyCreator onListCreate={createList} />
        </Show>
        <Show when={!noLists() && !state.showCreator}>You have lists</Show>
      </Show>

      <Show when={loading()}>
        <div>
          <Skeleton class="mx-auto h-8 w-80" />
          <Skeleton class="mx-auto mt-4 h-12 w-20" />
        </div>
      </Show>
    </>
  );
};
