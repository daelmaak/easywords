import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import type { Component } from 'solid-js';
import { Show, Suspense, createMemo, createSignal } from 'solid-js';
import type { SortState } from './components/VocabularyWords';
import { VocabularyWords } from './components/VocabularyWords';
import type { Word } from './model/vocabulary-model';
import {
  deleteWords,
  fetchVocabularyWithResults,
  updateWords,
  VOCABULARY_QUERY_KEY,
} from './resources/vocabulary-resource';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
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
import { WordEditorDialog } from './components/WordEditorDialog';
import { createMediaQuery } from '@solid-primitives/media';
import { VocabularySummary } from './components/VocabularySummary';
import { WordDetail } from './components/WordDetail';
import { VocabularyWordsToolbar } from './components/VocabularyWordsToolbar';

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
  const [wordToShowDetailId, setWordToShowDetailId] = createSignal<number>();

  const vocabularyQuery = createQuery(() => ({
    queryKey: [VOCABULARY_QUERY_KEY, vocabularyId],
    queryFn: () => fetchVocabularyWithResults(vocabularyId),
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

  const wordToShowDetail = createMemo(() =>
    wordToShowDetailId()
      ? vocabularyQuery.data?.words.find(w => w.id === wordToShowDetailId())
      : undefined
  );

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

  async function onWordsEdited(updatedWord: Word, resetWordToShow = false) {
    await updateWords(updatedWord);

    if (resetWordToShow) {
      setWordToShowDetailId(undefined);
    }
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
        <div class="min-w-56 rounded-lg bg-white px-6 py-4 shadow-md md:min-w-64 md:max-w-80">
          <VocabularySummary
            vocabulary={vocabularyQuery.data}
            lastTestResult={lastTestResultQuery.data}
            testProgress={testProgressQuery.data}
            onTestVocabulary={testVocabulary}
          />
        </div>

        <div class="flex flex-grow flex-col rounded-lg bg-white shadow-md lg:flex-grow-0">
          <div class="sticky top-0 z-10 rounded-t-lg bg-background md:static md:z-0">
            <VocabularyWordsToolbar
              words={vocabularyQuery.data?.words}
              selectedWords={selectedWords()}
              onSearch={setSearchedWords}
              onSelectAll={onSelectAll}
              onSort={sort}
              onTestSelected={testSelected}
              onDeleteSelected={deleteSelectedWords}
            />
          </div>
          <div class="overflow-y-auto px-2">
            <Suspense fallback={<div class="m-auto">Loading ...</div>}>
              <Show when={vocabularyQuery.data}>
                {v => (
                  <VocabularyWords
                    words={searchedWords() ?? v().words}
                    selectedWords={selectedWords()}
                    sort={sortState()}
                    onWordDetail={w => setWordToShowDetailId(w.id)}
                    onWordsSelected={setSelectedWords}
                  />
                )}
              </Show>
            </Suspense>
          </div>
        </div>

        <Show
          when={displayFullWordDetail()}
          fallback={
            <WordEditorDialog
              word={wordToShowDetail()}
              open={wordToShowDetail() != null}
              onClose={() => setWordToShowDetailId(undefined)}
              onWordEdited={w => onWordsEdited(w, true)}
            />
          }
        >
          <div class="hidden h-full grow lg:block">
            <Show when={wordToShowDetail()}>
              {word => (
                <WordDetail word={word()} onWordEdited={onWordsEdited} />
              )}
            </Show>
          </div>
        </Show>
      </Suspense>
    </main>
  );
};

export default VocabularyPage;
