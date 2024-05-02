import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { Show, createEffect, createSignal, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { VocabularyItem } from '../vocabularies/model/vocabulary-model';
import {
  deleteVocabularyProgress,
  fetchVocabularyProgress,
  saveVocabularyProgress,
} from '../vocabularies/resources/vocabulary-progress-api';
import { Results } from './components/Results';
import {
  VocabularySettings,
  VocabularyUserSettings,
} from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';
import { SavedProgress } from './vocabulary-testing-model';
import {
  deleteVocabularyItems,
  getVocabulary,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resource';

export const VocabularyTestPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const vocabularyId = +params.id;
  const vocabulary = getVocabulary(vocabularyId);

  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyUserSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
    });
  const [words, setWords] = createSignal<VocabularyItem[]>();
  const [invalidWords, setInvalidWords] = createSignal<VocabularyItem[]>();
  const [removedWords, setRemovedWords] = createSignal<VocabularyItem[]>();
  const [savedProgress, setSavedProgress] = createSignal<SavedProgress>();
  const [done, setDone] = createSignal(false);

  createEffect(() => {
    const vocab = vocabulary();

    if (vocab) {
      setWords(vocab.vocabularyItems);
    }
    return vocab;
  });

  onMount(async () => {
    if (!searchParams.useSavedProgress) {
      return;
    }

    const progress = await fetchVocabularyProgress(vocabularyId);
    setSavedProgress(progress);
  });

  async function onDone(
    leftOverWords?: VocabularyItem[],
    removedWords?: VocabularyItem[]
  ) {
    setDone(true);
    setInvalidWords(leftOverWords);
    setRemovedWords(removedWords);
    deleteVocabularyProgress(vocabularyId);
  }

  function onEditWord(word: VocabularyItem) {
    updateVocabularyItems(word);
  }

  function goBack() {
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

  async function deleteWord(word: VocabularyItem) {
    await deleteVocabularyItems(vocabularyId, word.id);
  }

  function saveProgress(progress: SavedProgress) {
    saveVocabularyProgress(vocabularyId, progress);
  }

  return (
    <>
      <Show when={!done()}>
        <Show when={words()}>
          {w => (
            <>
              <div class="m-auto">
                <VocabularyTester
                  mode={vocabularySettings.mode}
                  repeatInvalid={vocabularySettings.repeatInvalid}
                  reverse={vocabularySettings.reverseTranslations}
                  savedProgress={savedProgress()}
                  words={w()}
                  done={onDone}
                  editWord={onEditWord}
                  onProgress={saveProgress}
                  onRemoveWord={deleteWord}
                  onStop={goBack}
                  repeat={onRepeat}
                  reset={onReset}
                />
              </div>
              <div class="mt-auto">
                <VocabularySettings
                  settings={vocabularySettings}
                  onChange={setVocabularySettings}
                />
              </div>
            </>
          )}
        </Show>
      </Show>

      <Show when={done()}>
        <Results
          invalidWords={invalidWords()}
          removedWords={removedWords()}
          words={words()}
          repeat={onRepeat}
          reset={onReset}
          tryInvalidWords={onTryInvalidWords}
        />
      </Show>

      <Show when={words()}>
        <button
          class="btn-link fixed bottom-4 right-8 text-sm"
          onClick={goBack}
        >
          Go back
        </button>
      </Show>
    </>
  );
};
