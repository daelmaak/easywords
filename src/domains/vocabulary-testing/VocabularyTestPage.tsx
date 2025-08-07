import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Show, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { BackLink } from '~/components/BackLink';
import type { Vocabulary, Word } from '../vocabularies/model/vocabulary-model';
import {
  fetchVocabulary,
  updateVocabularyAsInteractedWith,
  updateWords,
  VOCABULARY_QUERY_KEY,
} from '../vocabularies/resources/vocabulary-resource';
import {
  createTestResult,
  fetchTestResult,
  saveTestResult,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import type { VocabularyTesterSettings } from './components/VocabularySettings';
import { VocabularySettings } from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';
import {
  createMutation,
  createQuery,
  useQueryClient,
} from '@tanstack/solid-query';
import type {
  TestResult,
  TestResultToCreate,
  TestResultWord,
} from '../vocabulary-results/model/test-result-model';
import {
  lastTestProgressKey,
  testResultKey,
} from '../vocabulary-results/resources/cache-keys';
import { testResultsRoute, testRoute, vocabularyRoute } from '~/routes/routes';

export const VocabularyTestPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const vocabularyId = +params.id;
  const testId = () => +params.testId || undefined;

  const vocabularyQuery = createQuery(() => ({
    queryKey: [VOCABULARY_QUERY_KEY, vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const testProgressQuery = createQuery(() => ({
    queryKey: testResultKey(testId()!),
    queryFn: () => fetchTestResult(testId()!),
    enabled: () => testId() != null,
  }));

  const createResultMutation = createMutation(() => ({
    mutationFn: (params: { vocabulary: Vocabulary; words: Word[] }) =>
      createTestResult(params.vocabulary, params.words),
    onSuccess: result =>
      queryClient.setQueryData(lastTestProgressKey(vocabularyId), result),
  }));

  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyTesterSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
      strictMatch: false,
    });

  const words = () => {
    const vocabulary = vocabularyQuery.data;

    if (vocabulary == null) {
      return;
    }

    let words = vocabulary.words;

    if (testProgressQuery.data) {
      // This dict is a performance optimization to avoid having to filter the words
      // by iterating over the saved progress words.
      const savedProgressDict = testProgressQuery.data.words.reduce(
        (acc, word) => {
          acc[word.word_id] = word;
          return acc;
        },
        {} as Record<number, TestResultWord>
      );

      words = vocabulary.words.filter(w => savedProgressDict[w.id] != null);
    }
    return words;
  };

  createEffect(async () => {
    if (testId() != null) {
      return;
    }

    const vocabulary = vocabularyQuery.data;

    if (vocabulary == null) {
      return;
    }

    let words: Word[] | undefined;

    if (searchParams.wordIds) {
      const wordIds = searchParams.wordIds.split(',').map(Number);
      words = vocabulary.words.filter(w => wordIds.includes(w.id));
    } else {
      words = vocabulary.words.filter(w => !w.archived);
    }

    const result = await createResultMutation.mutateAsync({
      vocabulary,
      words,
    });

    navigate(testRoute(vocabularyId, result.id), { replace: true });
  });

  createEffect(prevVocabularyId => {
    const vocabulary = vocabularyQuery.data;

    if (vocabulary == null || vocabulary.id === prevVocabularyId) {
      return vocabulary?.id;
    }
    void updateVocabularyAsInteractedWith(vocabulary.id);

    return vocabulary.id;
  });

  async function onDone(result: TestResult) {
    await saveTestResult(result);
    navigate(testResultsRoute(vocabularyId, result.id));
  }

  function onEditWord(word: Word) {
    void updateWords(word);
  }

  function goToVocabulary() {
    navigate(vocabularyRoute(vocabularyId));
  }

  async function archiveWord(word: Word) {
    await updateWords({ ...word, archived: true });
  }

  function saveProgress(result: TestResultToCreate) {
    void saveTestResult(result);
  }

  return (
    <div class="page-container h-full">
      {/* TODO don't use Suspense here since it causes rerender after navigating to the test page and pressing "Next word" button. 
          That breaks the maintenance/restoration of focus on the write tester input. */}
      <Show when={!vocabularyQuery.isLoading}>
        <BackLink href={vocabularyRoute(vocabularyId)}>
          Back to vocabulary
        </BackLink>
        <div class="mx-auto mt-4 flex items-center justify-center">
          <span class={`fi mr-2 size-5 fi-${vocabularyQuery.data?.country}`} />
          <h1>{vocabularyQuery.data?.name}</h1>
        </div>
        <Show when={vocabularyId} keyed>
          <Show when={words()}>
            {w => (
              <div class="mt-8 grid sm:grid-cols-[1fr_2fr_1fr]">
                <aside class="order-1 p-4 sm:order-none">
                  <h2 class="mb-4">Test Settings</h2>
                  <VocabularySettings
                    settings={vocabularySettings}
                    onChange={setVocabularySettings}
                  />
                </aside>
                <main class="m-auto mb-4 w-full">
                  <Show when={testProgressQuery.data}>
                    {testProgress => (
                      <VocabularyTester
                        testSettings={vocabularySettings}
                        testProgress={testProgress()}
                        vocabularyId={vocabularyId}
                        words={w()}
                        onDone={onDone}
                        onEditWord={onEditWord}
                        onProgress={saveProgress}
                        onArchiveWord={archiveWord}
                        onStop={goToVocabulary}
                      />
                    )}
                  </Show>
                </main>
              </div>
            )}
          </Show>
        </Show>
      </Show>
    </div>
  );
};
