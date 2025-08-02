import { createMediaQuery } from '@solid-primitives/media';
import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import type { Component } from 'solid-js';
import { createMemo, Show } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { Routes } from '~/routes/routes';
import {
  lastTestProgressKey,
  lastTestResultKey,
  testResultsKey,
} from '../vocabulary-results/resources/cache-keys';
import {
  deleteTestResult,
  fetchLastTestProgress,
  fetchLastTestResult,
  fetchTestResults,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import { combineVocabularyWithTestResults } from '../vocabulary-results/util/results-util';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
import { VocabularySummary } from './components/VocabularySummary';
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import { VocabularyWordsToolbar } from './components/toolbar/VocabularyWordsToolbar';
import { WordDetail } from './components/WordDetail';
import type { Word } from './model/vocabulary-model';
import {
  deleteVocabulary,
  deleteWords,
  fetchVocabulary,
  updateVocabulary,
  updateWords,
  VOCABULARY_QUERY_KEY,
} from './resources/vocabulary-resource';
import type { VocabularyWordsBlurState } from './model/vocabulary-state';
import { toSortedWords } from './util/word-sorting';

export const VocabularyPage: Component = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;

  const [store, setStore] = createStore({
    searchedWords: [] as Word[],
    selectedWords: [] as Word[],
    blurState: {
      original: false,
      translation: false,
    } as VocabularyWordsBlurState,
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
    queryKey: lastTestProgressKey(vocabularyId),
    queryFn: () => fetchLastTestProgress(vocabularyId),
  }));

  const lastTestResultQuery = createQuery(() => ({
    queryKey: lastTestResultKey(vocabularyId),
    queryFn: () => fetchLastTestResult(vocabularyId),
  }));

  const words = () => {
    const vocab = vocabularyWithResults();
    return vocab == null
      ? []
      : store.showArchivedWords
        ? vocab.words
        : vocab.words.filter(w => !w.archived);
  };

  const sortedWords = createMemo(() => {
    const w = words();
    return w && toSortedWords(w, store.sortState);
  });

  const isGteMdScreen = createMediaQuery('(min-width: 1024px)');

  const wordToShowDetail = createMemo(() =>
    store.wordToShowDetailId
      ? words()?.find(w => w.id === store.wordToShowDetailId)
      : undefined
  );

  async function onArchiveVocabulary(archive: boolean) {
    await updateVocabulary({ id: vocabularyId, archived: archive });
  }

  async function onDeleteVocabulary() {
    await deleteVocabulary(vocabularyId);
    navigate(Routes.Vocabularies);
  }

  async function onDeleteWord(word: Word) {
    await deleteWords(vocabularyId, word.id);
  }

  async function onDeleteResult(testResultId: number) {
    await deleteTestResult(testResultId);

    void testProgressQuery.refetch();
    void lastTestResultQuery.refetch();
  }

  function onSelectAll(selected: boolean) {
    if (selected) {
      setStore({ selectedWords: words() ?? [] });
    } else {
      setStore({ selectedWords: [] });
    }
  }

  function onSelectNext(amount: number) {
    const alreadySelectedLength = store.selectedWords.length;

    setStore('selectedWords', ws =>
      ws.concat(
        sortedWords()!.slice(
          alreadySelectedLength,
          alreadySelectedLength + amount
        )
      )
    );
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
    <div class="grid gap-4 bg-neutral-100 p-2 sm:grid-cols-[14rem_1fr] sm:grid-rows-[calc(100vh-57px-1rem)] md:grid-cols-[18rem_1fr] lg:grid-cols-[18rem_4fr_3fr] xl:grid-cols-[18rem_1fr_1fr]">
      <Show
        when={vocabularyQuery.isFetched && resultsQuery.isFetched}
        fallback={<div class="m-auto">Loading ...</div>}
      >
        <section
          aria-label="Vocabulary summary"
          class="h-full overflow-y-auto rounded-lg bg-white px-3 py-4 shadow-md md:px-6"
        >
          <Show when={vocabularyWithResults()}>
            {v => (
              <VocabularySummary
                vocabulary={v()}
                wordCount={words()?.length}
                lastTestResult={lastTestResultQuery.data}
                testProgress={testProgressQuery.data}
                onArchiveVocabulary={onArchiveVocabulary}
                onDeleteResult={onDeleteResult}
                onDeleteVocabulary={onDeleteVocabulary}
                onTestVocabulary={testVocabulary}
              />
            )}
          </Show>
        </section>

        <main
          aria-label="Vocabulary words"
          class="flex flex-grow flex-col rounded-lg bg-white shadow-md lg:flex-grow-0"
        >
          <Show when={words()}>
            {words => (
              <>
                <div class="sticky top-0 z-10 rounded-t-lg bg-background md:static md:z-0">
                  <VocabularyWordsToolbar
                    displayArchived={store.showArchivedWords}
                    words={sortedWords()}
                    selectedWords={store.selectedWords}
                    blurState={store.blurState}
                    sortState={store.sortState}
                    onSearch={words => setStore({ searchedWords: words })}
                    onSelectAll={onSelectAll}
                    onSelectNext={onSelectNext}
                    onSort={sort}
                    onTestSelected={testSelected}
                    onToggleDisplayArchived={() =>
                      setStore({
                        sortState: { asc: false, by: 'archived' },
                        showArchivedWords: !store.showArchivedWords,
                      })
                    }
                    onBlurStateChange={blurState => setStore({ blurState })}
                  />
                </div>
                <div class="h-full overflow-y-auto px-1 md:px-2">
                  <Show
                    when={words().length > 0}
                    fallback={
                      <div class="flex h-full w-full items-center justify-center text-neutral-600">
                        Add some words first!
                      </div>
                    }
                  >
                    <VocabularyWords
                      sortedWords={store.searchedWords ?? words()}
                      selectedWords={store.selectedWords}
                      blurState={store.blurState}
                      sortState={store.sortState}
                      vocabularyLang={vocabularyWithResults()!.country}
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
        </main>

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
          <section class="hidden h-full grow lg:block">
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
          </section>
        </Show>
      </Show>
    </div>
  );
};

export default VocabularyPage;
