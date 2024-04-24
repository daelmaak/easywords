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
  updateVocabulary,
  updateVocabularyItems,
} from './resources/vocabulary-resources';
import { VocabularyItem } from './vocabulary-model';
import { HiOutlinePlus, HiOutlineTrash } from 'solid-icons/hi';
import { CountrySelect } from '~/components/country-select/country-select';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

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

  function onVocabularyDataChange(event: Event) {
    const form = (event.target as Element).closest('form') as HTMLFormElement;
    const name = form.vocabularyName.value;
    const country = form.country.value;

    const vocab = vocabulary();

    if (!vocab || !name || !country) {
      return;
    }

    if (vocab.name === name && vocab.country === country) {
      return;
    }

    updateVocabulary({ id: vocabulary()?.id, name, country });
  }

  return (
    <div class="flex flex-col gap-4 sm:flex-row">
      <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
        <SheetContent class="w-svw sm:w-[30rem] flex flex-col gap-4">
          <SheetHeader>
            <SheetTitle>Add words</SheetTitle>
          </SheetHeader>
          <WordsInput mode="form" onWordsChange={setAddedWords} />
          <Button onClick={onSubmit}>Save</Button>
        </SheetContent>
      </Sheet>

      <Show when={vocabulary()}>
        {v => (
          <form onFocusOut={onVocabularyDataChange}>
            <Label for="vocabulary-name">List name</Label>
            <Input
              id="vocabulary-name"
              name="vocabularyName"
              value={v().name}
            />
            <div class="mt-4"></div>
            <Label for="country">Country</Label>
            <CountrySelect id="country" defaultValue={v().country} />
          </form>
        )}
      </Show>

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
