import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { cx } from 'class-variance-authority';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowsUpDown,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show, createSignal } from 'solid-js';
import { BackLink } from '~/components/BackLink';
import { ConfirmationDialog } from '~/components/ConfirmationDialog';
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
import { Checkbox } from '../../components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { WordsInput } from '../vocabulary-testing/components/WordsInput';
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import type { VocabularyItem } from './model/vocabulary-model';
import {
  createVocabularyItems,
  deleteVocabularyItems,
  getVocabularyResource,
  updateVocabulary,
  updateVocabularyItems,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from './util/navigation';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;
  const [addedWords, setAddedWords] = createSignal<VocabularyItem[]>([]);
  const [searchedWords, setSearchedWords] = createSignal<VocabularyItem[]>();
  const [selectedWords, setSelectedWords] = createSignal<VocabularyItem[]>([]);
  const [openedAddWords, setOpenedAddWords] = createSignal(false);
  const [creatingWords, setCreatingWords] = createSignal(false);
  const [sortState, setSortState] = createSignal<SortState>({
    asc: searchParams['sortasc'] === 'true',
    by: searchParams['sortby'] as SortState['by'] | undefined,
  });

  const vocabulary = getVocabularyResource(vocabularyId);

  let wordsInputFormRef!: HTMLFormElement;

  async function deleteSelectedWords() {
    const words = selectedWords();
    if (!words.length) {
      return;
    }

    await deleteVocabularyItems(...selectedWords().map(word => word.id));
    setSelectedWords([]);
  }

  async function onCreateWords() {
    // When no words were added yet, I attempt wordsInputForm submission because maybe
    // the user just didn't press "Add word" button.
    // If there already are some words added, I just check whether the wordsInputForm
    // is submittable, ie. whether it has filled out fields and is valid, and if it is
    // I submit it which adds a word.
    if (addedWords().length === 0 || wordsInputFormRef.checkValidity()) {
      wordsInputFormRef.requestSubmit();
    }

    // If still no words added, even after the form submission, just return. The native
    // form validation will display the error messages.
    if (addedWords().length === 0) {
      return;
    }

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

  function testVocabulary(config: { useSavedProgress: boolean }) {
    navigateToVocabularyTest(vocabularyId, navigate, config);
  }

  function testSelected() {
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: selectedWords().map(w => w.id),
    });
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

    void updateVocabulary({ id: vocabulary()?.id, name, country });
  }

  function sort(sortProps: Partial<SortState>) {
    setSortState(s => ({ ...s, ...sortProps }));
    setSearchParams({ sortby: sortProps.by, sortasc: sortProps.asc });
  }

  return (
    <Show
      when={!vocabulary.loading}
      fallback={<div class="m-auto">Loading ...</div>}
    >
      <main class="page-container flex flex-col gap-4 sm:flex-row">
        <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
          <SheetContent
            class="w-svw sm:w-[30rem] flex flex-col gap-4"
            onPointerDownOutside={e => e.preventDefault()}
          >
            <SheetHeader>
              <SheetTitle>Add words</SheetTitle>
            </SheetHeader>
            <WordsInput
              mode="form"
              ref={wordsInputFormRef}
              onWordsChange={setAddedWords}
            />
            <hr />
            <Button loading={creatingWords()} onClick={onCreateWords}>
              Save
            </Button>
          </SheetContent>
        </Sheet>

        <div class="min-w-56 sm:max-w-72 md:min-w-64">
          <BackLink class="mb-4">Back to vocabularies</BackLink>
          <Show when={vocabulary()}>
            {v => (
              <form onFocusOut={onVocabularyDataChange} autocomplete="off">
                <Label for="vocabulary-name">Vocabulary name</Label>
                <Input
                  id="vocabulary-name"
                  name="vocabularyName"
                  value={v().name}
                />
                <div class="mt-4"></div>
                <Label for="country">Language</Label>
                <CountrySelect id="country" defaultValue={v().country} />
              </form>
            )}
          </Show>

          <div class="mt-8 flex flex-col gap-4">
            <Button
              class="grow"
              size="sm"
              onClick={() => setOpenedAddWords(true)}
            >
              <HiOutlinePlus size={16} /> Add words
            </Button>
            <div class="flex flex-wrap gap-4">
              <Button
                class="grow"
                size="sm"
                variant={
                  vocabulary()?.savedProgress ? 'secondary' : 'defaultOutline'
                }
                onClick={() => testVocabulary({ useSavedProgress: false })}
              >
                <HiOutlineAcademicCap />
                Test all
              </Button>
              <Show when={vocabulary()?.savedProgress}>
                <Button
                  class="grow"
                  size="sm"
                  variant="defaultOutline"
                  onClick={() => testVocabulary({ useSavedProgress: true })}
                >
                  <HiOutlineAcademicCap />
                  Continue test
                </Button>
              </Show>
            </div>
          </div>
        </div>

        <div class="flex-grow flex flex-col items-center">
          <div class="sticky z-10 top-0 pb-4 w-full flex flex-wrap justify-center items-center gap-2 bg-background lg:gap-4">
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
                  Alphabetically
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
            <ConfirmationDialog
              confirmText="Delete"
              trigger={
                <Button
                  class={cx({
                    'hidden lg:inline lg:invisible':
                      selectedWords().length === 0,
                  })}
                  size="sm"
                  variant="destructive"
                >
                  <HiOutlineTrash size={16} /> Delete selected
                </Button>
              }
              onConfirm={deleteSelectedWords}
            />
            <Button
              class={cx({
                'hidden lg:inline lg:invisible': selectedWords().length === 0,
              })}
              size="sm"
              variant="defaultOutline"
              onClick={testSelected}
            >
              <HiOutlineAcademicCap /> Test selected
            </Button>
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
      </main>
    </Show>
  );
};

export default VocabularyPage;
