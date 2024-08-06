import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { VocabularyItem } from '../vocabularies/model/vocabulary-model';
import {
  deleteVocabularyProgress,
  fetchVocabularyProgress,
  saveVocabularyProgress,
} from '../vocabularies/resources/vocabulary-progress-api';
import { Results } from './components/Results';
import type { VocabularyTesterSettings } from './components/VocabularySettings';
import { VocabularySettings } from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';
import {
  deleteVocabularyItems,
  getVocabularyResource,
  updateVocabularyAsInteractedWith,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resource';
import { BackLink } from '~/components/BackLink';
import type {
  TestResult,
  TestResultWord,
} from '../vocabulary-results/model/test-result-model';
import { saveTestResult } from '../vocabulary-results/resources/test-result-resource';

export const VocabularyTestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const vocabularyId = +params.id;
  const vocabulary = getVocabularyResource(vocabularyId);

  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyTesterSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
      strictMatch: false,
    });
  const [words, setWords] = createSignal<VocabularyItem[]>();
  const [results, setResults] = createSignal<TestResultWord[]>();
  const [savedProgress, setSavedProgress] = createSignal<TestResult>();
  const [done, setDone] = createSignal(false);

  createEffect(() => {
    const vocab = vocabulary();

    if (vocab) {
      void updateVocabularyAsInteractedWith(vocab.id);
    }

    setInitialWords();
  });

  onMount(async () => {
    if (!searchParams.useSavedProgress) {
      return;
    }

    // move to the effect above, to handle stale vocabulary
    const progress = await fetchVocabularyProgress(vocabularyId);
    setSavedProgress(progress);
  });

  function setInitialWords() {
    // Vocabulary loading means the current one is either non existent or stale
    // so now words should be set at this moment.
    if (vocabulary.loading) {
      return;
    }

    const vocab = vocabulary();

    if (vocab == null) {
      return;
    }

    if (searchParams.wordIds) {
      const wordIds = searchParams.wordIds.split(',').map(Number);
      const words = vocab.vocabularyItems.filter(w => wordIds.includes(w.id));
      setWords(words);
    } else {
      setWords(vocab.vocabularyItems);
    }
  }

  function onDone(results: TestResultWord[]) {
    setDone(true);
    setResults(results);
    void deleteVocabularyProgress(vocabularyId);
    void saveTestResult({
      vocabularyId,
      done: true,
      words: results,
    });
  }

  function onEditWord(word: VocabularyItem) {
    void updateVocabularyItems(word);
  }

  function goToVocabularies() {
    navigate('/vocabulary');
  }

  function goToVocabulary() {
    navigate('..');
  }

  function onRepeat() {
    setInitialWords();
    setDone(false);
  }

  function onReset() {
    setWords();
    setDone(false);
  }

  function onTryInvalidWords(invalidWords: VocabularyItem[]) {
    setWords(invalidWords);
    setDone(false);
  }

  async function onWordsEdited(updatedWord: VocabularyItem) {
    await updateVocabularyItems(updatedWord);
  }

  async function deleteWord(word: VocabularyItem) {
    await deleteVocabularyItems(vocabularyId, word.id);
  }

  function saveProgress(results: TestResultWord[]) {
    void saveVocabularyProgress({
      done: false,
      vocabularyId,
      words: results,
    });
  }

  return (
    <div class="page-container h-full">
      <Show when={!vocabulary.loading}>
        <BackLink>Back to vocabulary</BackLink>
        <Show when={!done()}>
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
                      savedProgress={savedProgress()?.words}
                      words={w()}
                      onDone={onDone}
                      onEditWord={onEditWord}
                      onProgress={saveProgress}
                      onRemoveWord={deleteWord}
                      onStop={goToVocabulary}
                      onRepeat={onRepeat}
                      onReset={onReset}
                    />
                  </main>
                </div>
              )}
            </Show>
          </Show>
        </Show>

        <Show when={done() && results()}>
          {results => (
            <div class="mt-8">
              <Results
                results={results()}
                words={words()!}
                editWord={onWordsEdited}
                repeat={onRepeat}
                goToVocabularies={goToVocabularies}
                tryInvalidWords={onTryInvalidWords}
              />
            </div>
          )}
        </Show>
      </Show>
    </div>
  );
};
