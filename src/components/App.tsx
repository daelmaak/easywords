import { Show, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import Tester from './Tester';
import { WordsInput } from './WordsInput';

const App: Component = () => {
  const [words, setWords] = createSignal<WordTranslation[]>();

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
          {w => <Tester words={w} onAgain={reset} />}
        </Show>
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
