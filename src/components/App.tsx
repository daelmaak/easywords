import { Show, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import Tester from './Tester';
import { WordsInput } from './WordsInput';

const App: Component = () => {
  const [words, setWords] = createSignal<WordTranslation[]>();

  return (
    <div class="min-h-full grid p-8 bg-zinc-800">
      <div class="m-auto">
        <Show when={!words()}>
          <WordsInput onWords={setWords} />
        </Show>

        <Show keyed={true} when={words()}>
          {w => <Tester words={w} />}
        </Show>
      </div>
      <button
        class="btn-link fixed bottom-4 right-8 text-sm"
        onClick={() => setWords()}
      >
        Go back
      </button>
    </div>
  );
};

export default App;
