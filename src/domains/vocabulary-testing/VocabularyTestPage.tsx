import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Show, createEffect } from 'solid-js';
import { createStore } from 'solid-js/store';
import { BackLink } from '~/components/BackLink';
import type { Word } from '../vocabularies/model/vocabulary-model';
import {
  deleteWords,
  fetchVocabulary,
  updateVocabularyAsInteractedWith,
  updateWords,
} from '../vocabularies/resources/vocabulary-resource';
import {
  fetchTestProgress,
  saveTestResult,
} from '../vocabulary-results/resources/vocabulary-test-result-resource';
import type { VocabularyTesterSettings } from './components/VocabularySettings';
import { VocabularySettings } from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';
import { createQuery } from '@tanstack/solid-query';
import type {
  TestResultToCreate,
  TestResultWord,
} from '../vocabulary-results/model/test-result-model';

export const VocabularyTestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const vocabularyId = +params.id;

  const vocabularyQuery = createQuery(() => ({
    queryKey: ['vocabulary', vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const testProgressQuery = createQuery(() => ({
    queryKey: ['vocabulary', vocabularyId, 'progress'],
    queryFn: () => fetchTestProgress(vocabularyId).then(r => r ?? null),
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

    if (searchParams.wordIds) {
      const wordIds = searchParams.wordIds.split(',').map(Number);
      const words = vocabulary.words.filter(w => wordIds.includes(w.id));
      return words;
    }

    if (searchParams.useSavedProgress && testProgressQuery.data) {
      // This dict is a performance optimization to avoid having to filter the words
      // by iterating over the saved progress words.
      const savedProgressDict = testProgressQuery.data.words.reduce(
        (acc, word) => {
          acc[word.word_id] = word;
          return acc;
        },
        {} as Record<number, TestResultWord>
      );

      return vocabulary.words.filter(w => savedProgressDict[w.id] != null);
    }

    return vocabulary.words;
  };

  createEffect(prevVocabularyId => {
    const vocabulary = vocabularyQuery.data;

    if (vocabulary == null || vocabulary.id === prevVocabularyId) {
      return vocabulary?.id;
    }
    void updateVocabularyAsInteractedWith(vocabulary.id);

    return vocabulary.id;
  });

  async function onDone(result: TestResultToCreate) {
    await saveTestResult(result);
    navigate('results');
  }

  function onEditWord(word: Word) {
    void updateWords(word);
  }

  function goToVocabulary() {
    navigate('..');
  }

  async function deleteWord(word: Word) {
    await deleteWords(vocabularyId, word.id);
  }

  function saveProgress(result: TestResultToCreate) {
    void saveTestResult(result);
  }

  return (
    <div class="page-container h-full">
      {/* TODO don't use Suspense here since it causes rerender after navigating to the test page and pressing "Next word" button. 
          That breaks the maintenance/restoration of focus on the write tester input. */}
      <Show when={!vocabularyQuery.isLoading}>
        <BackLink>Back to vocabulary</BackLink>
        <div class="mx-auto flex justify-center items-center">
          <span class={`size-5 mr-2 fi fi-${vocabularyQuery.data?.country}`} />
          <h1>{vocabularyQuery.data?.name}</h1>
        </div>
        <Show when={vocabularyId} keyed>
          <Show when={words()}>
            {w => (
              <div class="mt-8 grid sm:grid-cols-[1fr_2fr_1fr]">
                <aside class="p-4 order-1 sm:order-none">
                  <h2 class="mb-4">Test Settings</h2>
                  <VocabularySettings
                    settings={vocabularySettings}
                    onChange={setVocabularySettings}
                  />
                </aside>
                <main class="m-auto mb-4">
                  <VocabularyTester
                    testSettings={vocabularySettings}
                    applySavedProgress={searchParams.useSavedProgress != null}
                    savedProgress={testProgressQuery.data}
                    vocabularyId={vocabularyId}
                    words={w()}
                    onDone={onDone}
                    onEditWord={onEditWord}
                    onProgress={saveProgress}
                    onRemoveWord={deleteWord}
                    onStop={goToVocabulary}
                  />
                </main>
              </div>
            )}
          </Show>
        </Show>
      </Show>
    </div>
  );
};
