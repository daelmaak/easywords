import { A, useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { cx } from 'class-variance-authority';
import {
  HiOutlineAcademicCap,
  HiOutlineArrowsUpDown,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show, Suspense, createResource, createSignal } from 'solid-js';
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
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import type { Word } from './model/vocabulary-model';
import {
  createWords,
  deleteWords,
  fetchVocabulary,
  updateWords,
  updateVocabulary,
  VOCABULARY_QUERY_KEY,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from './util/navigation';
import { fetchTestResults } from '../vocabulary-results/resources/vocabulary-test-result-resource';
import { VocabularyResultsMini } from '../vocabulary-results/components/VocabularyResultsMini';
import { createQuery } from '@tanstack/solid-query';
import { WordsAdder } from './components/WordsAdder';
import { WordTranslation } from '~/model/word-translation';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;

  const [searchedWords, setSearchedWords] = createSignal<Word[]>();
  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  const [openedAddWords, setOpenedAddWords] = createSignal(false);
  const [creatingWords, setCreatingWords] = createSignal(false);
  const [sortState, setSortState] = createSignal<SortState>({
    asc: searchParams['sortasc'] === 'true',
    by: (searchParams['sortby'] as SortState['by']) ?? 'original',
  });

  const vocabularyQuery = createQuery(() => ({
    queryKey: [VOCABULARY_QUERY_KEY, vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const [lastTestResult] = createResource(vocabularyId, fetchTestResults);

  let wordsInputFormRef!: HTMLFormElement;

  async function deleteSelectedWords() {
    const words = selectedWords();
    if (!words.length) {
      return;
    }

    await deleteWords(vocabularyId, ...selectedWords().map(word => word.id));
    setSelectedWords([]);
  }

  async function onCreateWords(words: WordTranslation[]) {
    setCreatingWords(true);
    await createWords(vocabularyId, ...words);
    setOpenedAddWords(false);
    setCreatingWords(false);
  }

  function onSelectAll(selected: boolean) {
    if (selected) {
      setSelectedWords(vocabularyQuery.data?.words ?? []);
    } else {
      setSelectedWords([]);
    }
  }

  async function onWordsEdited(updatedWords: Word[]) {
    await updateWords(...updatedWords);
  }

  function testVocabulary(config: { useSavedProgress: boolean }) {
    navigateToVocabularyTest(vocabularyId, navigate, config);
  }

  function testSelected() {
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: selectedWords().map(w => w.id),
    });
  }

  async function onVocabularyDataChange(event: Event) {
    const form = (event.target as Element).closest('form') as HTMLFormElement;
    const name = form.vocabularyName.value;
    const country = form.country.value;

    const vocabulary = vocabularyQuery.data;

    if (!vocabulary || !name || !country) {
      return;
    }

    if (vocabulary.name === name && vocabulary.country === country) {
      return;
    }

    await updateVocabulary({
      id: vocabulary.id,
      name,
      country,
    });
  }

  function sort(sortProps: Partial<SortState>) {
    setSortState(s => ({ ...s, ...sortProps }));
    setSearchParams({ sortby: sortProps.by, sortasc: sortProps.asc });
  }

  return (
    <main class="page-container h-full flex flex-col gap-4 sm:flex-row">
      <Suspense fallback={<div class="m-auto">Loading ...</div>}>
        <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
          <SheetContent
            class="w-svw sm:w-[30rem] flex flex-col gap-4"
            onPointerDownOutside={e => e.preventDefault()}
          >
            <SheetHeader>
              <SheetTitle>Add words</SheetTitle>
            </SheetHeader>

            <WordsAdder
              creatingWords={creatingWords()}
              onCreateWords={onCreateWords}
            />
          </SheetContent>
        </Sheet>

        <div class="min-w-56 sm:max-w-72 md:min-w-64">
          <BackLink class="mb-4">Back to vocabularies</BackLink>
          <Show when={vocabularyQuery.data}>
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
                  vocabularyQuery.data?.savedProgress
                    ? 'secondary'
                    : 'defaultOutline'
                }
                onClick={() => testVocabulary({ useSavedProgress: false })}
              >
                <HiOutlineAcademicCap />
                Test all
              </Button>
              <Show when={vocabularyQuery.data?.savedProgress}>
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

          <Show when={!lastTestResult.loading && lastTestResult()}>
            {result => (
              <A href="test/results">
                <VocabularyResultsMini result={result()} />
              </A>
            )}
          </Show>
        </div>

        <div class="mt-[-1rem] flex-grow flex flex-col items-center">
          <div class="sticky z-10 top-0 py-2 w-full flex flex-wrap justify-center items-center gap-2 bg-background lg:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button class="text-base font-normal" variant="ghost">
                  <HiOutlineArrowsUpDown class="size-5 mr-1" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent class="p-4">
                <DropdownMenuItem
                  as="button"
                  class="text-base"
                  onClick={() => sort({ by: 'createdAt', asc: true })}
                >
                  Oldest to newest
                </DropdownMenuItem>
                <DropdownMenuItem
                  as="button"
                  class="text-base"
                  onClick={() => sort({ by: 'createdAt', asc: false })}
                >
                  Newest to oldest
                </DropdownMenuItem>
                <DropdownMenuItem
                  as="button"
                  class="text-base"
                  onClick={() => sort({ by: 'original', asc: true })}
                >
                  Original (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  as="button"
                  class="text-base"
                  onClick={() => sort({ by: 'original', asc: false })}
                >
                  Original (Z-A)
                </DropdownMenuItem>
                <DropdownMenuItem
                  as="button"
                  class="text-base"
                  onClick={() => sort({ by: 'translation', asc: true })}
                >
                  Translation (A-Z)
                </DropdownMenuItem>
                <DropdownMenuItem
                  as="button"
                  class="text-base"
                  onClick={() => sort({ by: 'translation', asc: false })}
                >
                  Translation (Z-A)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Show when={selectedWords()}>
              <Checkbox
                checked={
                  selectedWords().length ===
                  (vocabularyQuery.data?.words.length ?? 0)
                }
                indeterminate={
                  selectedWords().length > 0 &&
                  selectedWords().length <
                    (vocabularyQuery.data?.words.length ?? 0)
                }
                label="Select"
                onChange={() => onSelectAll(selectedWords().length === 0)}
              />
            </Show>
            <Show when={vocabularyQuery.data}>
              {v => (
                <Search
                  placeholder="Search words..."
                  terms={v().words}
                  searchKeys={['original', 'translation']}
                  onSearch={setSearchedWords}
                />
              )}
            </Show>
            <ConfirmationDialog
              confirmText="Delete"
              trigger={
                <Button size="sm" variant="destructive">
                  <HiOutlineTrash size={16} /> Delete selected
                </Button>
              }
              triggerClass={cx({
                'hidden lg:inline lg:invisible': selectedWords().length === 0,
              })}
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

          <Show when={vocabularyQuery.data}>
            {v => (
              <VocabularyWords
                words={searchedWords() ?? v().words}
                selectedWords={selectedWords()}
                sort={sortState()}
                onWordsEdited={onWordsEdited}
                onWordsSelected={setSelectedWords}
              />
            )}
          </Show>
        </div>
      </Suspense>
    </main>
  );
};

export default VocabularyPage;
