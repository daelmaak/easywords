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
import { WordTranslation } from '~/model/word-translation';
import {
  createVocabulary,
  deleteVocabulary,
  updateVocabularyItem,
} from '../resources/vocabulary-resources';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';
import { VocabularyCard } from './VocabularyCard';
import { VocabularyCreator } from './VocabularyCreator';
import { VocabularyEditor } from './VocabularyEditor';

export type Props = {
  fetchVocabularies: ResourceReturn<VocabularyList[]>;
  onTestVocabulary: (id: number) => void;
};

export const VocabularyOverview: Component<Props> = props => {
  const [vocabularies, vocabulariesAction] = props.fetchVocabularies;
  const [createVocabularyOpen, setCreateVocabularyOpen] = createSignal(false);
  const [confirmDeletionOf, setConfirmDeletionOf] = createSignal<number>();
  const [vocabularyToEdit, setVocabularyToEdit] =
    createSignal<VocabularyList>();

  const loading = () => vocabularies() == null;

  async function doDeleteVocabulary(listId: number) {
    const success = await deleteVocabulary(listId);

    if (success) {
      vocabulariesAction.mutate(l => l?.filter(list => list.id !== listId));
    }
  }

  function onCloseDeletionDialog() {
    setConfirmDeletionOf(undefined);
  }

  async function onCreateVocabulary(name: string, words: WordTranslation[]) {
    const success = await createVocabulary(name, words);

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

  async function onWordEdited(listId: number, updatedWord: VocabularyItem) {
    updateVocabularyItem(listId, updatedWord);
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
              <SheetHeader>
                <SheetTitle>Create new vocabulary</SheetTitle>
              </SheetHeader>
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
              <VocabularyCard
                list={list}
                onDeleteVocabulary={listId => setConfirmDeletionOf(listId)}
                onEditVocabulary={list => setVocabularyToEdit(list)}
                onTestVocabulary={props.onTestVocabulary}
              />
            )}
          </For>
        </section>

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

        <Sheet
          open={vocabularyToEdit() != null}
          onOpenChange={() => setVocabularyToEdit(undefined)}
        >
          <SheetContent class="w-svw sm:w-[30rem]">
            <Show when={vocabularyToEdit()}>
              {vocabulary => (
                <>
                  <SheetHeader>
                    <SheetTitle>
                      Edit <span class="font-normal">{vocabulary().name}</span>
                    </SheetTitle>
                  </SheetHeader>
                  <VocabularyEditor
                    vocabulary={vocabulary()}
                    onWordEdited={w => onWordEdited(vocabulary().id, w)}
                  />
                </>
              )}
            </Show>
          </SheetContent>
        </Sheet>
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
