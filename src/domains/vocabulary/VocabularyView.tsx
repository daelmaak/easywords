import { get, set } from 'idb-keyval';
import { Show, createEffect, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../../parser/simple-md-parser';
import { Results } from './Results';
import { VocabularyTestMode, VocabularyTester } from './Tester';
import { VocabularySettings } from './VocabularySettings';
import { WordsInput } from './WordsInput';

export const VocabularyView: Component = () => {
  const [lastWords, setLastWords] = createSignal<WordTranslation[]>();
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [mode, setMode] = createSignal<VocabularyTestMode>('write');
  const [repeatInvalid, setRepeatInvalid] = createSignal(false);
  const [reverse, setReverse] = createSignal(false);
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
            reverse={reverse()}
            storedWords={lastWords()}
          />
        </div>
      </Show>

      <Show when={!done()}>
        <Show keyed={true} when={words()}>
          {w => (
            <VocabularyTester
              mode={mode()}
              repeatInvalid={repeatInvalid()}
              reverse={reverse()}
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
        modeChange={setMode}
        onRepeatInvalid={setRepeatInvalid}
        reverseTranslations={setReverse}
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
