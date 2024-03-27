import { HiOutlinePlus } from 'solid-icons/hi';
import {
  Component,
  For,
  ResourceReturn,
  Show,
  createSignal,
  lazy,
} from 'solid-js';
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
  updateVocabularyItems,
} from '../resources/vocabulary-resources';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';
import { VocabularyCard } from './VocabularyCard';
import { VocabularyCreator } from './VocabularyCreator';

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
  const anyVocabularies = () => !!vocabularies()?.length;

  const VocabularyEditor = lazy(() => import('./VocabularyEditor'));

  function closeWordEditor() {
    setVocabularyToEdit(undefined);
  }

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

  async function onWordsEdited(listId: number, updatedWords: VocabularyItem[]) {
    await updateVocabularyItems(listId, ...updatedWords);
    closeWordEditor();
  }

  return (
    <div>
      <Show when={!loading()}>
        <div class="flex gap-8">
          <h1 class="text-lg font-bold mb-4">Your vocabularies</h1>
          <Show when={anyVocabularies()}>
            <Button size="sm" onClick={() => setCreateVocabularyOpen(true)}>
              <HiOutlinePlus size={16} /> Add vocabulary
            </Button>
          </Show>
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
          <section class="h-full flex flex-col sm:grid sm:items-start sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            <For each={vocabularies()}>
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

        <Sheet
          modal={true}
          open={vocabularyToEdit() != null}
          onOpenChange={closeWordEditor}
        >
          <SheetContent
            class="w-svw sm:w-[30rem]"
            onOpenAutoFocus={e => e.preventDefault()}
            onPointerDownOutside={e => e.preventDefault()}
          >
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
                    onWordsEdited={ws => onWordsEdited(vocabulary().id, ws)}
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
