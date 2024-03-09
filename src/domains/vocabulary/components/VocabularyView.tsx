import { Show, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { WordTranslation } from '~/model/word-translation';
import { Results } from './Results';
import {
  VocabularySettings,
  VocabularyUserSettings,
} from './VocabularySettings';
import { VocabularyTester } from './VocabularyTester';
import { VocabularyListManager } from './list-manager/VocabularyListManager';
import { fetchVocabulary } from '../resources/vocabulary-resources';
import { createVocabularyList } from '../resources/vocabulary-api';

export const VocabularyView = () => {
  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyUserSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
    });
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [invalidWords, setInvalidWords] = createSignal<WordTranslation[]>();
  const [removedWords, setRemovedWords] = createSignal<WordTranslation[]>();
  const [done, setDone] = createSignal(false);

  async function onDone(
    leftOverWords?: WordTranslation[],
    removedWords?: WordTranslation[]
  ) {
    setDone(true);
    setInvalidWords(leftOverWords);
    setRemovedWords(removedWords);
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

  function onTryInvalidWords(invalidWords: WordTranslation[]) {
    setInvalidWords();
    setWords(invalidWords);
    setDone(false);
  }

  return (
    <div class="h-full w-full grid">
      <div class="my-auto w-full">
        <VocabularyListManager
          createVocabulary={createVocabularyList}
          fetchVocabulary={fetchVocabulary}
        />

        <Show when={!done()}>
          <Show keyed={true} when={words()}>
            {w => (
              <>
                <VocabularyTester
                  mode={vocabularySettings.mode}
                  repeatInvalid={vocabularySettings.repeatInvalid}
                  reverse={vocabularySettings.reverseTranslations}
                  words={w}
                  done={onDone}
                  repeat={onRepeat}
                  reset={onReset}
                />
                <VocabularySettings
                  settings={vocabularySettings}
                  onChange={setVocabularySettings}
                />
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
      </div>

      <Show when={words()}>
        <button
          class="btn-link fixed bottom-4 right-8 text-sm"
          onClick={onReset}
        >
          Go back
        </button>
      </Show>
    </div>
  );
};
