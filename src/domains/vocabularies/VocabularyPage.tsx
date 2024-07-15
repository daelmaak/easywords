import { useNavigate, useParams } from '@solidjs/router';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowsUpDown,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'solid-icons/hi';
import type { Component} from 'solid-js';
import { Show, createSignal } from 'solid-js';
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
import type { SortState } from './components/VocabularyWords';
import VocabularyWords from './components/VocabularyWords';
import type { VocabularyItem } from './model/vocabulary-model';
import {
  createVocabularyItems,
  deleteVocabularyItems,
  getVocabulary,
  updateVocabulary,
  updateVocabularyItems,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from './util/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Checkbox } from '../../components/ui/checkbox';
import { cx } from 'class-variance-authority';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;
  const [addedWords, setAddedWords] = createSignal<VocabularyItem[]>([]);
  const [searchedWords, setSearchedWords] = createSignal<VocabularyItem[]>();
  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const [openedAddWords, setOpenedAddWords] = createSignal(false);
  const [creatingWords, setCreatingWords] = createSignal(false);
  const [sortState, setSortState] = createSignal<SortState>({
    asc: false,
  });

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

  function onSelectAll(selected: boolean) {
    if (selected) {
      setSelectedWords(vocabulary()?.vocabularyItems ?? []);
    } else {
      setSelectedWords([]);
    }
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

  function sort(sortProps: Partial<SortState>) {
    setSortState(s => ({ ...s, ...sortProps }));
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

        <div>
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

          <div class="mt-8 flex flex-wrap gap-4">
            <Button
              class="grow"
              size="sm"
              onClick={() => setOpenedAddWords(true)}
            >
              <HiOutlinePlus size={16} /> Add words
            </Button>
            <Button
              class="grow"
              size="sm"
              variant="secondary"
              onClick={() => onTestVocabulary(vocabularyId)}
            >
              <HiOutlineAcademicCap />
              Test
            </Button>
          </div>
        </div>

        <div class="flex-grow flex flex-col items-center">
          <div class="sticky z-10 top-0 w-full flex flex-wrap justify-center items-center gap-2 bg-background p-4 sm:gap-8">
            <div class="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button class="text-base font-normal" variant="ghost">
                    <HiOutlineArrowsUpDown class="size-5 mr-1" /> Sort
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="p-4">
                  <DropdownMenuItem
                    class="text-base"
                    onClick={() => sort({ by: 'created_at', asc: true })}
                  >
                    Oldest to newest
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="text-base"
                    onClick={() => sort({ by: 'created_at', asc: false })}
                  >
                    Newest to oldest
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    class="text-base"
                    onClick={() => sort({ by: undefined })}
                  >
                    None
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Show when={selectedWords()}>
                <Checkbox
                  checked={
                    selectedWords().length ===
                    (vocabulary()?.vocabularyItems.length ?? 0)
                  }
                  indeterminate={
                    selectedWords().length > 0 &&
                    selectedWords().length <
                      (vocabulary()?.vocabularyItems.length ?? 0)
                  }
                  label="Select"
                  onChange={() => onSelectAll(selectedWords().length === 0)}
                />
              </Show>
            </div>
            <div class="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
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
              <Button
                class={cx({ invisible: selectedWords().length === 0 })}
                size="sm"
                variant="destructive"
                onClick={deleteSelectedWords}
              >
                <HiOutlineTrash size={16} /> Delete selected
              </Button>
            </div>
          </div>

          <Show when={vocabulary()}>
            {v => (
              <VocabularyWords
                words={searchedWords() ?? v().vocabularyItems}
                selectedWords={selectedWords()}
                sort={sortState()}
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
