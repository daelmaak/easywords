import { HiOutlinePlus, HiOutlineTrash } from 'solid-icons/hi';
import { Component, For, ResourceReturn, Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { WordTranslation } from '~/model/word-translation';
import { VocabularyApi } from '../../resources/vocabulary-api';
import { VocabularyList } from '../../vocabulary-model';
import { VocabularyCreator } from './VocabularyCreator';
import { Skeleton } from '~/components/ui/skeleton';

type Props = {
  fetchVocabulary: ResourceReturn<VocabularyList[]>;
  vocabularyApi: VocabularyApi;
};

export const VocabularyOverview: Component<Props> = props => {
  const [vocabularies, vocabulariesAction] = props.fetchVocabulary;
  const [createVocabularyOpen, setCreateVocabularyOpen] = createSignal(false);

  const loading = () => vocabularies() == null;

  async function onCreateVocabulary(name: string, words: WordTranslation[]) {
    const success = await props.vocabularyApi.createVocabularyList(name, words);

    if (success) {
      setCreateVocabularyOpen(false);
      vocabulariesAction.refetch();
    }

    return success;
  }

  async function onDeleteVocabulary(id: number) {
    const success = await props.vocabularyApi.deleteVocabularyList(id);

    if (success) {
      vocabulariesAction.mutate(l => l?.filter(list => list.id !== id));
    }
  }

  return (
    <div>
      <Show when={!loading()}>
        <div class="flex justify-between">
          <h1 class="text-xl font-bold mb-4">Your vocabulary lists</h1>
          <Button onClick={() => setCreateVocabularyOpen(true)}>
            <HiOutlinePlus size={20} /> Add vocabulary
          </Button>
          <Sheet
            open={createVocabularyOpen()}
            onOpenChange={open => setCreateVocabularyOpen(open)}
          >
            <SheetContent class="w-svw sm:w-[30rem]">
              <h2 class="text-lg font-bold mb-4">New vocabulary list</h2>
              <VocabularyCreator onListCreate={onCreateVocabulary} />
            </SheetContent>
          </Sheet>
        </div>

        <section class="h-full flex flex-col sm:grid sm:items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          <For
            each={vocabularies()}
            fallback={
              <div class="m-auto" data-testid="empty-vocabulary-list">
                No vocabulary yet
              </div>
            }
          >
            {list => (
              <Card>
                <CardHeader class="flex flex-row justify-between items-center gap-4">
                  <CardTitle>{list.name}</CardTitle>
                  <HiOutlineTrash
                    class="cursor-pointer"
                    size={16}
                    onClick={() => onDeleteVocabulary(list.id)}
                  />
                </CardHeader>
                <CardContent class="max-h-80 overflow-hidden">
                  <ul>
                    <For each={list.vocabularyItems.slice(0, 10)}>
                      {item => (
                        <li>
                          {item.original} - {item.translation}
                        </li>
                      )}
                    </For>
                    <Show when={list.vocabularyItems.length > 10}>
                      <li class="text-center">...</li>
                    </Show>
                  </ul>
                </CardContent>
              </Card>
            )}
          </For>
        </section>
      </Show>

      <Show when={loading()}>
        <div>
          <Skeleton class="mx-auto h-8 w-80" />
          <Skeleton class="mx-auto mt-4 h-12 w-20" />
        </div>
      </Show>
    </div>
  );
};
