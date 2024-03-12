import { useParams } from '@solidjs/router';
import { Show, createEffect, createSignal } from 'solid-js';
import { createStore } from 'solid-js/store';
import { WordTranslation } from '~/model/word-translation';
import { fetchVocabulary } from '../vocabularies/resources/vocabulary-resources';
import { Results } from './components/Results';
import {
  VocabularySettings,
  VocabularyUserSettings,
} from './components/VocabularySettings';
import { VocabularyTester } from './components/VocabularyTester';

export const VocabularyTestPage = () => {
  const params = useParams();
  const vocabulary = () => fetchVocabulary(+params.id);

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

  createEffect(() => {
    const vocab = vocabulary();

    if (vocab) {
      setWords(vocab.vocabularyItems);
    }
    return vocab;
  });

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
    <>
      <Show when={!done()}>
        <Show keyed={true} when={words()}>
          {w => (
            <>
              <div class="m-auto">
                <VocabularyTester
                  mode={vocabularySettings.mode}
                  repeatInvalid={vocabularySettings.repeatInvalid}
                  reverse={vocabularySettings.reverseTranslations}
                  words={w}
                  done={onDone}
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
          onClick={onReset}
        >
          Go back
        </button>
      </Show>
    </>
  );
};
