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
import type { SavedProgress } from './vocabulary-testing-model';
import {
  deleteVocabularyItems,
  getVocabularyResource,
  updateVocabularyAsInteractedWith,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resource';
import { BackLink } from '~/components/BackLink';

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
    });
  const [words, setWords] = createSignal<VocabularyItem[]>();
  const [invalidWords, setInvalidWords] = createSignal<VocabularyItem[]>();
  const [savedProgress, setSavedProgress] = createSignal<SavedProgress>();
  const [done, setDone] = createSignal(false);

  createEffect(() => {
    const vocab = vocabulary();

    if (vocab) {
      if (searchParams.wordIds) {
        const wordIds = searchParams.wordIds.split(',').map(Number);
        const words = vocab.vocabularyItems.filter(w => wordIds.includes(w.id));
        setWords(words);
      } else {
        setWords(vocab.vocabularyItems);
      }

      void updateVocabularyAsInteractedWith(vocab.id);
    }
  });

  onMount(async () => {
    if (!searchParams.useSavedProgress) {
      return;
    }

    const progress = await fetchVocabularyProgress(vocabularyId);
    setSavedProgress(progress);
  });

  function onDone(leftOverWords?: VocabularyItem[]) {
    setDone(true);
    setInvalidWords(leftOverWords);
    void deleteVocabularyProgress(vocabularyId);
  }

  function onEditWord(word: VocabularyItem) {
    void updateVocabularyItems(word);
  }

  function goToVocabularies() {
    navigate('/vocabulary');
  }

  function onRepeat() {
    setInvalidWords();
    setDone(false);
  }

  function onReset() {
    setInvalidWords();
    setWords();
    setDone(false);
  }

  function onTryInvalidWords(invalidWords: VocabularyItem[]) {
    setInvalidWords();
    setWords(invalidWords);
    setDone(false);
  }

  async function onWordsEdited(updatedWord: VocabularyItem) {
    await updateVocabularyItems(updatedWord);
    setInvalidWords(ws =>
      ws?.map(w => (w.id === updatedWord.id ? updatedWord : w))
    );
  }

  async function deleteWord(word: VocabularyItem) {
    await deleteVocabularyItems(vocabularyId, word.id);
  }

  function saveProgress(progress: SavedProgress) {
    void saveVocabularyProgress(vocabularyId, progress);
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
                      savedProgress={savedProgress()}
                      words={w()}
                      onDone={onDone}
                      onEditWord={onEditWord}
                      onProgress={saveProgress}
                      onRemoveWord={deleteWord}
                      onStop={goToVocabularies}
                      onRepeat={onRepeat}
                      onReset={onReset}
                    />
                  </main>
                </div>
              )}
            </Show>
          </Show>
        </Show>

        <Show when={done() && words()}>
          {words => (
            <Results
              words={words()}
              invalidWords={invalidWords()}
              editWord={onWordsEdited}
              repeat={onRepeat}
              goToVocabularies={goToVocabularies}
              tryInvalidWords={onTryInvalidWords}
            />
          )}
        </Show>
      </Show>
    </div>
  );
};
