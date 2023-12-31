import { get, set } from 'idb-keyval';
import { Show, createEffect, createSignal, type Component } from 'solid-js';
import { createStore } from 'solid-js/store';
import { WordTranslation } from '../../parser/simple-md-parser';
import { Results } from './Results';
import { VocabularyTester } from './Tester';
import {
  VocabularySettings,
  VocabularyUserSettings,
} from './VocabularySettings';
import { WordsInput } from './WordsInput';

export const VocabularyView: Component = () => {
  const [vocabularySettings, setVocabularySettings] =
    createStore<VocabularyUserSettings>({
      mode: 'write',
      reverseTranslations: false,
      repeatInvalid: false,
    });
  const [lastWords, setLastWords] = createSignal<WordTranslation[]>();
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [invalidWords, setInvalidWords] = createSignal<WordTranslation[]>();
  const [done, setDone] = createSignal(false);

  createEffect(async () => {
    setLastWords(await get<WordTranslation[]>('last-words'));
  });

  async function onDone(leftOverWords?: WordTranslation[]) {
    setDone(true);
    setInvalidWords(leftOverWords);
    await storeWords(leftOverWords);
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

  async function selectWords(words: WordTranslation[]) {
    setInvalidWords();
    setWords(words);
    await storeWords(words);
  }

  async function storeWords(words?: WordTranslation[]) {
    await set('last-words', words);
  }

  return (
    <div class="m-auto">
      <Show when={!words() && !done()}>
        <div class="mx-auto max-w-[25rem]">
          <WordsInput
            onWordsSelect={selectWords}
            reverse={vocabularySettings.reverseTranslations}
            storedWords={lastWords()}
          />
        </div>
      </Show>

      <Show when={!done()}>
        <Show keyed={true} when={words()}>
          {w => (
            <VocabularyTester
              mode={vocabularySettings.mode}
              repeatInvalid={vocabularySettings.repeatInvalid}
              reverse={vocabularySettings.reverseTranslations}
              words={w}
              done={onDone}
              repeat={onRepeat}
              reset={onReset}
            />
          )}
        </Show>
      </Show>

      <Show when={done()}>
        <Results
          invalidWords={invalidWords()}
          repeat={onRepeat}
          reset={onReset}
          tryInvalidWords={onTryInvalidWords}
        />
      </Show>

      <VocabularySettings
        settings={vocabularySettings}
        onChange={setVocabularySettings}
      />

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
