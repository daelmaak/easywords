import { useParams } from '@solidjs/router';
import { HiOutlinePlus, HiOutlineTrash } from 'solid-icons/hi';
import { Component, Show, createSignal } from 'solid-js';
import { CountrySelect } from '~/components/country-select/country-select';
import { Search } from '~/components/search/Search';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { WordsInput } from '../vocabulary-testing/components/WordsInput';
import VocabularyEditor from './components/VocabularyEditor';
import {
  createVocabularyItems,
  deleteVocabularyItems,
  getVocabulary,
  updateVocabulary,
  updateVocabularyItems,
} from './resources/vocabulary-resources';
import { VocabularyItem } from './model/vocabulary-model';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const vocabularyId = +params.id;
  const [addedWords, setAddedWords] = createSignal<VocabularyItem[]>([]);
  const [searchedWords, setSearchedWords] = createSignal<VocabularyItem[]>();
  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const [openedAddWords, setOpenedAddWords] = createSignal(false);

  const vocabulary = () => getVocabulary(vocabularyId);

  async function deleteSelectedWords() {
    const words = selectedWords();
    if (!words.length) {
      return;
    }

    await deleteVocabularyItems(
      vocabularyId,
      ...selectedWords().map(word => word.id)
    );
    setSelectedWords([]);
  }

  async function onAddWords() {
    await createVocabularyItems(vocabularyId, ...addedWords());
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
          <Button onClick={onAddWords}>Save</Button>
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

      <div class="flex-grow flex flex-col items-center">
        <div class="sticky top-0 w-full flex justify-center items-center gap-2 bg-background p-4">
          <Show when={vocabulary()}>
            {v => (
              <Search
                terms={v().vocabularyItems}
                searchKeys={['original', 'translation']}
                onSearch={setSearchedWords}
              />
            )}
          </Show>
          <Button size="sm" onClick={() => setOpenedAddWords(true)}>
            <HiOutlinePlus size={16} /> Add words
          </Button>
          <Show when={selectedWords().length > 0}>
            <Button size="sm" variant="secondary" onClick={deleteSelectedWords}>
              <HiOutlineTrash size={16} /> Delete selected
            </Button>
          </Show>
        </div>
        <Show when={vocabulary()}>
          {v => (
            <VocabularyEditor
              words={searchedWords() ?? v().vocabularyItems}
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

export default VocabularyPage;
