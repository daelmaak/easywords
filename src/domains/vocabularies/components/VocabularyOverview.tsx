import { HiOutlinePlus } from 'solid-icons/hi';
import { Component, For, ResourceReturn, Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '~/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { Skeleton } from '~/components/ui/skeleton';
import {
  createVocabulary,
  deleteVocabulary,
} from '../resources/vocabularies-resource';
import { Vocabulary } from '../model/vocabulary-model';
import { VocabularyCard } from './VocabularyCard';
import { VocabularyCreator } from './VocabularyCreator';
import { VocabularyToCreate } from '../resources/vocabulary-api';

export type Props = {
  vocabulariesResource: ResourceReturn<Vocabulary[]>;
  onGoToVocabulary: (id: number) => void;
  onTestVocabulary: (
    id: number,
    config?: { useSavedProgress: boolean }
  ) => void;
};

export const VocabularyOverview: Component<Props> = props => {
  const [vocabularies, vocabulariesAction] = props.vocabulariesResource;
  const [createVocabularyOpen, setCreateVocabularyOpen] = createSignal(false);
  const [confirmDeletionOf, setConfirmDeletionOf] = createSignal<number>();

  const loading = () => vocabularies() == null;
  const anyVocabularies = () => !!vocabularies()?.length;

  async function doDeleteVocabulary(listId: number) {
    const success = await deleteVocabulary(listId);

    if (success) {
      vocabulariesAction.mutate(l => l?.filter(list => list.id !== listId));
    }
  }

  function onCloseDeletionDialog() {
    setConfirmDeletionOf(undefined);
  }

  async function onCreateVocabulary(vocabulary: VocabularyToCreate) {
    const success = await createVocabulary(vocabulary);

    if (success) {
      setCreateVocabularyOpen(false);
      vocabulariesAction.refetch();
    }

    return success;
  }

  async function onDeleteVocabulary() {
    const listId = confirmDeletionOf();
    setConfirmDeletionOf(undefined);

    if (listId == null) {
      return;
    }

    await doDeleteVocabulary(listId);
  }

  return (
    <div>
      <Show when={!loading()}>
        <div class="flex flex-wrap justify-between gap-x-4">
          <h1 class="text-lg font-semibold">Your vocabularies</h1>
          <Show when={anyVocabularies()}>
            <Button size="sm" onClick={() => setCreateVocabularyOpen(true)}>
              <HiOutlinePlus size={16} /> Add vocabulary
            </Button>
          </Show>
          <Sheet
            open={createVocabularyOpen()}
            onOpenChange={open => setCreateVocabularyOpen(open)}
          >
            <SheetContent
              class="w-svw sm:w-[30rem]"
              onPointerDownOutside={e => e.preventDefault()}
            >
              <SheetHeader>
                <SheetTitle>Create new vocabulary</SheetTitle>
              </SheetHeader>
              <VocabularyCreator onListCreate={onCreateVocabulary} />
            </SheetContent>
          </Sheet>
        </div>

        <Show
          when={anyVocabularies()}
          fallback={
            <div
              class="h-full flex flex-col gap-4 justify-center items-center"
              data-testid="empty-vocabulary-list"
            >
              Create your first vocabulary
              <Button size="sm" onClick={() => setCreateVocabularyOpen(true)}>
                <HiOutlinePlus size={16} /> Create
              </Button>
            </div>
          }
        >
          <section class="mt-6 h-full flex flex-col sm:grid sm:justify-center sm:content-start grid-cols-[repeat(auto-fit,_18rem)] gap-4">
            <For each={vocabularies()}>
              {vocabulary => (
                <VocabularyCard
                  vocabulary={vocabulary}
                  onClick={props.onGoToVocabulary}
                  onDeleteVocabulary={setConfirmDeletionOf}
                  onEditVocabulary={props.onGoToVocabulary}
                  onTestVocabulary={props.onTestVocabulary}
                />
              )}
            </For>
          </section>
        </Show>

        <Dialog
          open={confirmDeletionOf() != null}
          onOpenChange={onCloseDeletionDialog}
        >
          <DialogContent class="w-80">
            <DialogHeader>
              <h2 class="text-lg font-bold">You sure?</h2>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={onCloseDeletionDialog}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDeleteVocabulary}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
