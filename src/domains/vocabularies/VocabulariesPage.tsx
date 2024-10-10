import { useNavigate, useSearchParams } from '@solidjs/router';
import { HiOutlinePlus } from 'solid-icons/hi';
import { createSignal, For, Show, Suspense } from 'solid-js';
import { ConfirmationDialog } from '~/components/ConfirmationDialog';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { VocabularyCard } from './components/VocabularyCard';
import { VocabularyCreator } from './components/VocabularyCreator';
import type { VocabularyToCreate } from './resources/vocabulary-resource';
import {
  createVocabulary,
  deleteVocabulary,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from './util/navigation';
import { createQuery } from '@tanstack/solid-query';
import {
  fetchVocabularies,
  VOCABULARIES_QUERY_KEY,
} from './resources/vocabularies-resource';

export const VocabulariesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const vocabulariesQuery = createQuery(() => ({
    queryKey: [VOCABULARIES_QUERY_KEY],
    queryFn: () => fetchVocabularies(),
  }));
  const [createVocabularyOpen, setCreateVocabularyOpen] = createSignal(
    searchParams.openVocabCreator != null
  );
  const [confirmDeletionOf, setConfirmDeletionOf] = createSignal<number>();

  const anyVocabularies = () => vocabulariesQuery.data?.length ?? 0 > 0;
  const vocabulariesByRecency = () =>
    vocabulariesQuery.data
      ?.slice()
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  function onCloseDeletionDialog() {
    setConfirmDeletionOf(undefined);
  }

  async function onCreateVocabulary(vocabulary: VocabularyToCreate) {
    const success = await createVocabulary(vocabulary);

    if (success) {
      setCreateVocabularyOpen(false);
    }

    return success;
  }

  async function onDeleteVocabulary() {
    const vocabularyId = confirmDeletionOf();
    setConfirmDeletionOf(undefined);

    if (vocabularyId == null) {
      return;
    }

    await deleteVocabulary(vocabularyId);
  }

  function onGoToVocabulary(id: number) {
    navigate(`/vocabulary/${id}`);
  }

  function onTestVocabulary(
    id: number,
    config?: { useSavedProgress: boolean }
  ) {
    navigateToVocabularyTest(id, navigate, config);
  }

  return (
    <main class="min-h-full bg-gray-100">
      <Suspense fallback={<div>Loading...</div>}>
        <div class="page-container flex flex-wrap justify-between gap-x-4">
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
              class="h-60 flex flex-col gap-4 justify-center items-center"
              data-testid="empty-vocabulary-list"
            >
              <h2 class="text-xl">Create your first vocabulary!</h2>
              <Button
                onClick={() => setCreateVocabularyOpen(true)}
                type="button"
              >
                <HiOutlinePlus size={16} /> Create
              </Button>
            </div>
          }
        >
          <div class="mt-6 px-2 pb-12 flex flex-col gap-4 sm:grid sm:justify-center sm:content-start sm:items-start sm:grid-cols-[repeat(auto-fit,_18rem)]">
            <For each={vocabulariesByRecency()}>
              {vocabulary => (
                <VocabularyCard
                  vocabulary={vocabulary}
                  onClick={onGoToVocabulary}
                  onDeleteVocabulary={setConfirmDeletionOf}
                  onTestVocabulary={onTestVocabulary}
                />
              )}
            </For>
          </div>
        </Show>

        <ConfirmationDialog
          open={confirmDeletionOf() != null}
          confirmText="Delete"
          onClose={onCloseDeletionDialog}
          onCancel={onCloseDeletionDialog}
          onConfirm={onDeleteVocabulary}
        />
      </Suspense>
    </main>
  );
};
