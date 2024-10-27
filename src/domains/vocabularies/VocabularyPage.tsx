import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { cx } from 'class-variance-authority';
import { HiOutlineAcademicCap, HiOutlineTrash } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show, Suspense, createSignal } from 'solid-js';
import { ConfirmationDialog } from '~/components/ConfirmationDialog';
import { Search } from '~/components/search/Search';
import { Button } from '~/components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import type { Word } from './model/vocabulary-model';
import {
  deleteWords,
  fetchVocabulary,
  updateWords,
  VOCABULARY_QUERY_KEY,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from './util/navigation';
import {
  fetchLastTestResult,
  fetchTestProgress,
  saveTestResult,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import { createQuery } from '@tanstack/solid-query';
import {
  lastTestResultKey,
  testProgressKey,
} from '../vocabulary-results/resources/cache-keys';
import { VocabularyWordsSorter } from './components/VocabularyWordsSorter';
import { WordEditorDialog } from './components/WordEditorDialog';
import { createMediaQuery } from '@solid-primitives/media';
import { VocabularySummary } from './components/VocabularySummary';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;

  const [searchedWords, setSearchedWords] = createSignal<Word[]>();
  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  const [sortState, setSortState] = createSignal<SortState>({
    asc: searchParams['sortasc'] === 'false',
    by: (searchParams['sortby'] as SortState['by']) ?? 'createdAt',
  });
  const [wordToShowDetail, setWordToShowDetail] = createSignal<Word>();

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

  const displayFullWordDetail = createMediaQuery('(min-width: 1024px)');

  async function deleteSelectedWords() {
    const words = selectedWords();
    if (!words.length) {
      return;
    }

    await deleteWords(vocabularyId, ...selectedWords().map(word => word.id));
    setSelectedWords([]);
  }

  function onSelectAll(selected: boolean) {
    if (selected) {
      setSelectedWords(vocabularyQuery.data?.words ?? []);
    } else {
      setSelectedWords([]);
    }
  }

  async function onWordsEdited(...updatedWords: Word[]) {
    await updateWords(...updatedWords);
    setWordToShowDetail(undefined);
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

  function sort(sortProps: Partial<SortState>) {
    setSortState(s => ({ ...s, ...sortProps }));
    setSearchParams({ sortby: sortProps.by, sortasc: sortProps.asc });
  }

  return (
    <main class="page-container flex h-full flex-col gap-4 bg-neutral-100 p-2 sm:max-h-[calc(100vh-57px)] sm:flex-row">
      <Suspense fallback={<div class="m-auto">Loading ...</div>}>
        <div class="min-w-56 rounded-lg bg-white px-6 py-4 shadow-md md:min-w-64">
          <VocabularySummary
            vocabulary={vocabularyQuery.data}
            lastTestResult={lastTestResultQuery.data}
            testProgress={testProgressQuery.data}
            onTestVocabulary={testVocabulary}
          />
        </div>

        <Show
          when={displayFullWordDetail()}
          fallback={
            <WordEditorDialog
              word={wordToShowDetail()}
              open={wordToShowDetail() != null}
              onClose={() => setWordToShowDetail(undefined)}
              onWordEdited={onWordsEdited}
            />
          }
        >
          <div class="hidden h-full grow lg:block">
            {wordToShowDetail()?.original}
          </div>
        </Show>

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
                  onWordDetail={setWordToShowDetail}
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
