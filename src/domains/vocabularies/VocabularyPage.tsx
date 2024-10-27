import { A, useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { cx } from 'class-variance-authority';
import {
  HiOutlineAcademicCap,
  HiOutlinePlus,
  HiOutlineTrash,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show, Suspense, createSignal } from 'solid-js';
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
import {
  fetchLastTestResult,
  fetchTestProgress,
  saveTestResult,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import { VocabularyResultsMini } from '../vocabulary-results/components/VocabularyResultsMini';
import { createQuery } from '@tanstack/solid-query';
import { WordsAdder } from './components/WordsAdder';
import type { WordTranslation } from '~/model/word-translation';
import {
  lastTestResultKey,
  testProgressKey,
} from '../vocabulary-results/resources/cache-keys';
import { VocabularyWordsSorter } from './components/VocabularyWordsSorter';

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
    asc: searchParams['sortasc'] === 'false',
    by: (searchParams['sortby'] as SortState['by']) ?? 'createdAt',
  });

  const vocabularyQuery = createQuery(() => ({
    queryKey: [VOCABULARY_QUERY_KEY, vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const testProgressQuery = createQuery(() => ({
    queryKey: testProgressKey(vocabularyId),
    queryFn: () => fetchTestProgress(vocabularyId).then(r => r ?? null),
  }));

  const lastTestResultQuery = createQuery(() => ({
    queryKey: lastTestResultKey(vocabularyId),
    queryFn: () => fetchLastTestResult(vocabularyId).then(r => r ?? null),
  }));

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
    if (!config.useSavedProgress && testProgressQuery.data) {
      void saveTestResult({ ...testProgressQuery.data, done: true });
    }
    navigateToVocabularyTest(vocabularyId, navigate, config);
  }

  function testSelected() {
    if (testProgressQuery.data) {
      void saveTestResult({ ...testProgressQuery.data, done: true });
    }
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
    <main class="page-container flex h-full flex-col gap-4 bg-neutral-100 p-2 sm:max-h-[calc(100vh-57px)] sm:flex-row">
      <Suspense fallback={<div class="m-auto">Loading ...</div>}>
        <Sheet open={openedAddWords()} onOpenChange={setOpenedAddWords}>
          <SheetContent
            class="flex w-svw flex-col gap-4 sm:w-[30rem]"
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

        <div class="min-w-56 rounded-lg bg-white px-6 py-4 shadow-md md:min-w-64">
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
                  vocabularyQuery.data?.testInProgress
                    ? 'secondary'
                    : 'defaultOutline'
                }
                onClick={() => testVocabulary({ useSavedProgress: false })}
              >
                <HiOutlineAcademicCap />
                Test all ({vocabularyQuery.data?.words?.length})
              </Button>
              <Show when={vocabularyQuery.data?.testInProgress}>
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

          <Show when={testProgressQuery.data}>
            {progress => (
              <A href="test?useSavedProgress=true">
                <VocabularyResultsMini result={progress()} />
              </A>
            )}
          </Show>

          <Show when={lastTestResultQuery.data}>
            {result => (
              <A href="test/results">
                <VocabularyResultsMini result={result()} />
              </A>
            )}
          </Show>
        </div>

        <div class="hidden h-full grow lg:block">Detail content</div>

        <div class="flex flex-grow flex-col rounded-lg bg-white shadow-md lg:flex-grow-0">
          <div class="sticky top-0 z-10 flex w-full flex-wrap items-center gap-1 rounded-t-lg border-b border-neutral-100 bg-background bg-white px-2 pb-2 pt-1 text-sm md:static md:z-0 lg:gap-2">
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
                onChange={() => onSelectAll(selectedWords().length === 0)}
              />
            </Show>
            <VocabularyWordsSorter sort={sort} />
            <Show when={vocabularyQuery.data}>
              {v => (
                <Search
                  class="h-8 w-40 py-0"
                  placeholder="Search words..."
                  terms={v().words}
                  searchKeys={['original', 'translation']}
                  onSearch={setSearchedWords}
                />
              )}
            </Show>
            <Button
              class={cx({
                'hidden lg:invisible lg:inline': selectedWords().length === 0,
              })}
              size="sm"
              variant="default"
              onClick={testSelected}
            >
              <HiOutlineAcademicCap /> Test
            </Button>
            <ConfirmationDialog
              confirmText="Delete"
              trigger={
                <Button class="px-2" size="sm" variant="ghost">
                  <HiOutlineTrash size={18} class="text-destructive" />
                </Button>
              }
              triggerClass={cx({
                'hidden lg:inline lg:invisible': selectedWords().length === 0,
              })}
              onConfirm={deleteSelectedWords}
            />
          </div>
          <div class="overflow-y-auto px-2">
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
        </div>
      </Suspense>
    </main>
  );
};

export default VocabularyPage;
