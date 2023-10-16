import { Show, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import { Results } from './Results';
import Tester, { TestMode } from './Tester';
import { Toggle } from './Toggle';
import { WordsInput } from './WordsInput';

const App: Component = () => {
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [mode, setMode] = createSignal<TestMode>('write');
  const [reverse, setReverse] = createSignal(false);
  const [invalidWords, setInvalidWords] = createSignal<WordTranslation[]>();

  function onDone(invalidWords?: WordTranslation[]) {
    setInvalidWords(invalidWords);
    setWords();
  }

  function onRepeat() {
    setInvalidWords();
  }

  function onReset() {
    setInvalidWords();
    setWords();
  }

  function onTryInvalidWords(invalidWords: WordTranslation[]) {
    setInvalidWords();
    setWords(invalidWords);
  }

  function selectWords(words: WordTranslation[]) {
    setInvalidWords();
    setWords(words);
  }

  return (
    <div class="min-h-full grid p-8 bg-zinc-800">
      <div class="m-auto">
        <Show when={!words()}>
          <WordsInput onWords={selectWords} reverse={reverse()} />
        </Show>

        <Show keyed={true} when={words()}>
          {w => (
            <Tester
              mode={mode()}
              reverse={reverse()}
              words={w}
              done={onDone}
              repeat={onRepeat}
              reset={onReset}
            />
          )}
        </Show>

        <Results
          invalidWords={invalidWords()}
          tryInvalidWords={onTryInvalidWords}
        />

        <div class="mt-20 flex justify-center gap-4 text-slate-400">
          <Toggle label="Reverse" onChange={() => setReverse(!reverse())} />
          <Toggle
            defaultValue={mode() === 'write'}
            label="Write words"
            onChange={() => setMode(mode() === 'guess' ? 'write' : 'guess')}
          />
        </div>
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

export default App;
