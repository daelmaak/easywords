import { get, set } from 'idb-keyval';
import { Show, createEffect, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../../parser/simple-md-parser';
import { Config } from './Config';
import { Results } from './Results';
import { VocabularyTestMode, VocabularyTester } from './Tester';
import { WordsInput } from './WordsInput';

export const VocabularyView: Component = () => {
  const [lastWords, setLastWords] = createSignal<WordTranslation[]>();
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [mode, setMode] = createSignal<VocabularyTestMode>('write');
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
        <WordsInput
          onWordsSelect={selectWords}
          reverse={reverse()}
          storedWords={lastWords()}
        />
      </Show>

      <Show when={!done()}>
        <Show keyed={true} when={words()}>
          {w => (
            <VocabularyTester
              mode={mode()}
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

      <Config modeChange={setMode} reverseTranslations={setReverse} />

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
