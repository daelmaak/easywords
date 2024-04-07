import { useParams } from '@solidjs/router';
import { Component, Show, createSignal, lazy } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { WordsInput } from '../vocabulary-testing/components/WordsInput';
import {
  getVocabulary,
  updateVocabularyItems,
} from './resources/vocabulary-resources';
import { VocabularyItem } from './vocabulary-model';
import { HiOutlinePlus, HiOutlineTrash } from 'solid-icons/hi';

export const VocabularyPage: Component = () => {
  const VocabularyEditor = lazy(() => import('./components/VocabularyEditor'));
  const params = useParams();
  const vocabularyId = +params.id;
  const [addedWords, setAddedWords] = createSignal<VocabularyItem[]>([]);
  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const [openedAddWords, setOpenedAddWords] = createSignal(false);

  const vocabulary = () => getVocabulary(vocabularyId);

  async function onSubmit() {
    await updateVocabularyItems(vocabularyId, ...addedWords());
    setAddedWords([]);
    setOpenedAddWords(false);
  }

  async function onWordsEdited(updatedWords: VocabularyItem[]) {
    await updateVocabularyItems(vocabularyId, ...updatedWords);
  }

  return (
    <div>
      <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
        <SheetContent class="w-svw sm:w-[30rem] flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle>Add words</SheetTitle>
          </SheetHeader>
          <WordsInput mode="form" onWordsChange={setAddedWords} />
          <Button onClick={onSubmit}>Save</Button>
        </SheetContent>
      </Sheet>

      <div class="mx-auto max-w-[32rem]">
        <div class="mb-4 flex gap-2">
          <Button size="sm" onClick={() => setOpenedAddWords(true)}>
            <HiOutlinePlus size={20} /> Add words
          </Button>
          <Show when={selectedWords().length > 0}>
            <Button size="sm" variant="secondary">
              <HiOutlineTrash size={16} /> Delete selected
            </Button>
          </Show>
        </div>
        <Show when={vocabulary()}>
          {v => (
            <VocabularyEditor
              selectedWords={selectedWords()}
              vocabulary={v()}
              onWordsEdited={onWordsEdited}
              onWordsSelected={setSelectedWords}
            />
          )}
        </Show>
      </div>
    </div>
  );
};
