import { Show, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import Tester, { TestMode } from './Tester';
import { WordsInput } from './WordsInput';
import { Toggle } from './Toggle';

const App: Component = () => {
  const [words, setWords] = createSignal<WordTranslation[]>();
  const [mode, setMode] = createSignal<TestMode>('write');
  const [reverse, setReverse] = createSignal(false);

  function reset() {
    setWords();
  }

  return (
    <div class="min-h-full grid p-8 bg-zinc-800">
      <div class="m-auto">
        <Show when={!words()}>
          <WordsInput onWords={setWords} />
        </Show>

        <Show keyed={true} when={words()}>
          {w => (
            <Tester
              mode={mode()}
              reverse={reverse()}
              words={w}
              onAgain={reset}
            />
          )}
        </Show>
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
        <button class="btn-link fixed bottom-4 right-8 text-sm" onClick={reset}>
          Go back
        </button>
      </Show>
    </div>
  );
};

export default App;
