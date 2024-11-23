import { createMediaQuery } from '@solid-primitives/media';
import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import type { Component } from 'solid-js';
import { createMemo, Show, Suspense } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { Routes } from '~/routes/routes';
import {
  lastTestResultKey,
  testResultKey,
  testResultsKey,
} from '../vocabulary-results/resources/cache-keys';
import {
  fetchLastTestProgress,
  fetchLastTestResult,
  fetchTestResults,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import { combineVocabularyWithTestResults } from '../vocabulary-results/util/results-util';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
import { VocabularySummary } from './components/VocabularySummary';
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import { VocabularyWordsToolbar } from './components/VocabularyWordsToolbar';
import { WordDetail } from './components/WordDetail';
import type { Word } from './model/vocabulary-model';
import {
  deleteVocabulary,
  deleteWords,
  fetchVocabulary,
  updateWords,
  VOCABULARY_QUERY_KEY,
} from './resources/vocabulary-resource';

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
    showArchivedWords: false,
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
    queryKey: testResultKey(vocabularyId),
    queryFn: () => fetchLastTestProgress(vocabularyId),
  }));

  const lastTestResultQuery = createQuery(() => ({
    queryKey: lastTestResultKey(vocabularyId),
    queryFn: () => fetchLastTestResult(vocabularyId),
  }));

  const words = () =>
    store.showArchivedWords
      ? vocabularyWithResults()?.words
      : vocabularyWithResults()?.words.filter(w => !w.archived);

  const isGteMdScreen = createMediaQuery('(min-width: 1024px)');

  const wordToShowDetail = createMemo(() =>
    store.wordToShowDetailId
      ? words()?.find(w => w.id === store.wordToShowDetailId)
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

  async function onDeleteWord(word: Word) {
    await deleteWords(vocabularyId, word.id);
  }

  function onSelectAll(selected: boolean) {
    if (selected) {
      setStore({ selectedWords: words() ?? [] });
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

  function testVocabulary(testId?: number) {
    navigateToVocabularyTest(vocabularyId, navigate, {
      testId,
    });
  }

  function testSelected() {
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
        <div class="min-w-56 rounded-lg bg-white px-6 py-4 shadow-md md:max-w-72">
          <Show when={vocabularyWithResults()}>
            {v => (
              <VocabularySummary
                vocabulary={v()}
                lastTestResult={lastTestResultQuery.data}
                testProgress={testProgressQuery.data}
                onDeleteVocabulary={onDeleteVocabulary}
                onTestVocabulary={testVocabulary}
              />
            )}
          </Show>
        </div>

        <div class="flex flex-grow flex-col rounded-lg bg-white shadow-md lg:flex-grow-0">
          <Show when={words()}>
            {words => (
              <>
                <div class="sticky top-0 z-10 rounded-t-lg bg-background md:static md:z-0">
                  <VocabularyWordsToolbar
                    displayArchived={store.showArchivedWords}
                    words={words()}
                    selectedWords={store.selectedWords}
                    sortState={store.sortState}
                    onSearch={words => setStore({ searchedWords: words })}
                    onSelectAll={onSelectAll}
                    onSort={sort}
                    onTestSelected={testSelected}
                    onDeleteSelected={deleteSelectedWords}
                    onToggleDisplayArchived={() =>
                      setStore({ showArchivedWords: !store.showArchivedWords })
                    }
                  />
                </div>
                <div class="h-full overflow-y-auto px-2">
                  <Show
                    when={words().length > 0}
                    fallback={
                      <div class="flex h-full w-full items-center justify-center text-neutral-600">
                        Add some words first!
                      </div>
                    }
                  >
                    <VocabularyWords
                      words={store.searchedWords ?? words()}
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
          when={isGteMdScreen()}
          fallback={
            <Show when={wordToShowDetail()}>
              {word => (
                <Sheet
                  open={true}
                  onOpenChange={() =>
                    setStore({ wordToShowDetailId: undefined })
                  }
                >
                  <SheetContent
                    class="w-full p-0 sm:w-auto"
                    onOpenAutoFocus={e => e.preventDefault()}
                  >
                    <WordDetail
                      word={word()}
                      onWordDelete={() => onDeleteWord(word())}
                      onWordEdited={onWordsEdited}
                    />
                  </SheetContent>
                </Sheet>
              )}
            </Show>
          }
        >
          <div class="hidden h-full grow lg:block">
            <Show when={wordToShowDetail()}>
              {word => (
                <WordDetail
                  word={word()}
                  onClose={() => setStore({ wordToShowDetailId: undefined })}
                  onWordDelete={() => onDeleteWord(word())}
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
