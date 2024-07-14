import { useNavigate, useParams } from '@solidjs/router';
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'solid-icons/hi';
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
import { VocabularyItem } from './model/vocabulary-model';
import {
  createVocabularyItems,
  deleteVocabularyItems,
  getVocabulary,
  updateVocabulary,
  updateVocabularyItems,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from './util/navigation';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;
  const [addedWords, setAddedWords] = createSignal<VocabularyItem[]>([]);
  const [searchedWords, setSearchedWords] = createSignal<VocabularyItem[]>();
  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const [openedAddWords, setOpenedAddWords] = createSignal(false);
  const [creatingWords, setCreatingWords] = createSignal(false);

  const vocabulary = getVocabulary(vocabularyId);

  async function deleteSelectedWords() {
    const words = selectedWords();
    if (!words.length) {
      return;
    }

    await deleteVocabularyItems(...selectedWords().map(word => word.id));
    setSelectedWords([]);
  }

  async function onAddWords() {
    setCreatingWords(true);
    await createVocabularyItems(vocabularyId, ...addedWords());
    setAddedWords([]);
    setOpenedAddWords(false);
    setCreatingWords(false);
  }

  async function onWordsEdited(updatedWords: VocabularyItem[]) {
    await updateVocabularyItems(...updatedWords);
  }

  function onTestVocabulary(id: number) {
    navigateToVocabularyTest(id, navigate);
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
    <Show
      when={!vocabulary.loading}
      fallback={<div class="m-auto">Loading ...</div>}
    >
      <div class="page-container flex flex-col gap-4 sm:flex-row">
        <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
          <SheetContent
            class="w-svw sm:w-[30rem] flex flex-col gap-4"
            onPointerDownOutside={e => e.preventDefault()}
          >
            <SheetHeader>
              <SheetTitle>Add words</SheetTitle>
            </SheetHeader>
            <WordsInput mode="form" onWordsChange={setAddedWords} />
            <Button loading={creatingWords()} onClick={onAddWords}>
              Save
            </Button>
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
          <div class="sticky z-10 top-0 w-full flex flex-wrap justify-center items-center gap-2 bg-background p-4">
            <div class="flex gap-2">
              <Button size="sm" onClick={() => setOpenedAddWords(true)}>
                <HiOutlinePlus size={16} /> Add words
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onTestVocabulary(vocabularyId)}
              >
                <HiOutlineAcademicCap />
                Test
              </Button>
              <Show when={selectedWords().length > 0}>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={deleteSelectedWords}
                >
                  <HiOutlineTrash size={16} /> Delete selected
                </Button>
              </Show>
            </div>
            <Show when={vocabulary()}>
              {v => (
                <Search
                  placeholder="Search words..."
                  terms={v().vocabularyItems}
                  searchKeys={['original', 'translation']}
                  onSearch={setSearchedWords}
                />
              )}
            </Show>
          </div>
          <Show when={vocabulary()}>
            {v => (
              <VocabularyEditor
                words={searchedWords() ?? v().vocabularyItems}
                selectedWords={selectedWords()}
                sort={{
                  by: 'created_at',
                  asc: false,
                }}
                vocabulary={v()}
                onWordsEdited={onWordsEdited}
                onWordsSelected={setSelectedWords}
              />
            )}
          </Show>
        </div>
      </div>
    </Show>
  );
};

export default VocabularyPage;
