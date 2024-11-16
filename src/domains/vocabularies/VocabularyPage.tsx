import { createMediaQuery } from '@solid-primitives/media';
import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import type { Component } from 'solid-js';
import { createMemo, Show, Suspense } from 'solid-js';
import { createStore } from 'solid-js/store';
import {
  lastTestResultKey,
  testProgressKey,
  testResultsKey,
} from '../vocabulary-results/resources/cache-keys';
import {
  fetchLastTestResult,
  fetchTestProgress,
  fetchTestResults,
  saveTestResult,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import { combineVocabularyWithTestResults } from '../vocabulary-results/util/results-util';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
import { VocabularySummary } from './components/VocabularySummary';
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import { VocabularyWordsToolbar } from './components/VocabularyWordsToolbar';
import { WordDetail } from './components/WordDetail';
import { WordEditorDialog } from './components/WordEditorDialog';
import type { Word } from './model/vocabulary-model';
import {
  deleteVocabulary,
  deleteWords,
  fetchVocabulary,
  updateWords,
  VOCABULARY_QUERY_KEY,
} from './resources/vocabulary-resource';
import { Routes } from '~/routes/routes';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;

  const [store, setStore] = createStore({
    searchedWords: [] as Word[],
    selectedWords: [] as Word[],
    sortState: {
      asc: searchParams['sortasc'] === 'true',
      by: (searchParams['sortby'] as SortState['by']) ?? 'createdAt',
    },
    wordToShowDetailId: undefined as number | undefined,
  });

  const vocabularyQuery = createQuery(() => ({
    queryKey: [VOCABULARY_QUERY_KEY, vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const resultsQuery = createQuery(() => ({
    queryKey: testResultsKey(vocabularyId),
    queryFn: () => fetchTestResults(vocabularyId, { upToDaysAgo: 30 }),
  }));

  const vocabularyWithResults = createMemo(() =>
    combineVocabularyWithTestResults(vocabularyQuery.data, resultsQuery.data)
  );

  const testProgressQuery = createQuery(() => ({
    queryKey: testProgressKey(vocabularyId),
    queryFn: () => fetchTestProgress(vocabularyId).then(r => r ?? null),
  }));

  const lastTestResultQuery = createQuery(() => ({
    queryKey: lastTestResultKey(vocabularyId),
    queryFn: () => fetchLastTestResult(vocabularyId).then(r => r ?? null),
  }));

  const displayFullWordDetail = createMediaQuery('(min-width: 1024px)');

  const wordToShowDetail = createMemo(() =>
    store.wordToShowDetailId
      ? vocabularyWithResults()?.words.find(
          w => w.id === store.wordToShowDetailId
        )
      : undefined
  );

  async function deleteSelectedWords() {
    const words = store.selectedWords;
    if (!words.length) {
      return;
    }

    await deleteWords(
      vocabularyId,
      ...store.selectedWords.map(word => word.id)
    );
    setStore({ selectedWords: [] });
  }

  async function onDeleteVocabulary() {
    await deleteVocabulary(vocabularyId);
    navigate(Routes.Vocabularies);
  }

  function onSelectAll(selected: boolean) {
    if (selected) {
      setStore({ selectedWords: vocabularyWithResults()?.words ?? [] });
    } else {
      setStore({ selectedWords: [] });
    }
  }

  async function onWordsEdited(updatedWord: Word, resetWordToShow = false) {
    await updateWords(updatedWord);

    if (resetWordToShow) {
      setStore({ wordToShowDetailId: undefined });
    }
  }

  function testVocabulary(config: { useSavedProgress: boolean }) {
    if (!config.useSavedProgress && testProgressQuery.data) {
      // Finish the last test progress
      void saveTestResult({ ...testProgressQuery.data, done: true });
    }
    navigateToVocabularyTest(vocabularyId, navigate, config);
  }

  function testSelected() {
    if (testProgressQuery.data) {
      // Finish the last test progress
      void saveTestResult({ ...testProgressQuery.data, done: true });
    }
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: store.selectedWords.map(w => w.id),
    });
  }

  function sort(sortProps: Partial<SortState>) {
    setStore({ sortState: { ...store.sortState, ...sortProps } });
    setSearchParams({ sortby: sortProps.by, sortasc: sortProps.asc });
  }

  return (
    <main class="page-container flex h-full flex-col gap-4 bg-neutral-100 p-2 sm:max-h-[calc(100vh-57px)] sm:flex-row">
      <Suspense fallback={<div class="m-auto">Loading ...</div>}>
        <div class="min-w-56 rounded-lg bg-white px-6 py-4 shadow-md md:min-w-64 md:max-w-80">
          <VocabularySummary
            vocabulary={vocabularyWithResults()}
            lastTestResult={lastTestResultQuery.data}
            testProgress={testProgressQuery.data}
            onDeleteVocabulary={onDeleteVocabulary}
            onTestVocabulary={testVocabulary}
          />
        </div>

        <div class="flex flex-grow flex-col rounded-lg bg-white shadow-md lg:flex-grow-0">
          <Show when={vocabularyWithResults()}>
            {v => (
              <>
                <div class="sticky top-0 z-10 rounded-t-lg bg-background md:static md:z-0">
                  <VocabularyWordsToolbar
                    words={v().words}
                    selectedWords={store.selectedWords}
                    sortState={store.sortState}
                    onSearch={words => setStore({ searchedWords: words })}
                    onSelectAll={onSelectAll}
                    onSort={sort}
                    onTestSelected={testSelected}
                    onDeleteSelected={deleteSelectedWords}
                  />
                </div>
                <div class="h-full overflow-y-auto px-2">
                  <Show
                    when={v().words.length > 0}
                    fallback={
                      <div class="flex h-full w-full items-center justify-center text-neutral-600">
                        Add some words first!
                      </div>
                    }
                  >
                    <VocabularyWords
                      words={store.searchedWords ?? v().words}
                      selectedWords={store.selectedWords}
                      sortState={store.sortState}
                      onWordDetail={w => setStore({ wordToShowDetailId: w.id })}
                      onWordsSelected={words =>
                        setStore({ selectedWords: words })
                      }
                    />
                  </Show>
                </div>
              </>
            )}
          </Show>
        </div>

        <Show
          when={displayFullWordDetail()}
          fallback={
            <WordEditorDialog
              word={wordToShowDetail()}
              open={wordToShowDetail() != null}
              onClose={() => setStore({ wordToShowDetailId: undefined })}
              onWordEdited={w => onWordsEdited(w, true)}
            />
          }
        >
          <div class="hidden h-full grow lg:block">
            <Show when={wordToShowDetail()}>
              {word => (
                <WordDetail
                  word={word()}
                  onClose={() => setStore({ wordToShowDetailId: undefined })}
                  onWordEdited={onWordsEdited}
                />
              )}
            </Show>
          </div>
        </Show>
      </Suspense>
    </main>
  );
};

export default VocabularyPage;
