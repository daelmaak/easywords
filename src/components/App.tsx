import { Show, createSignal, type Component } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import Tester from './Tester';
import { WordsInput } from './WordsInput';

const App: Component = () => {
  const [words, setWords] = createSignal<WordTranslation[]>();

  return (
    <div class="h-full grid bg-zinc-800 text-slate-50">
      <div class="m-auto flex gap-4">
        <Show when={!words()}>
          <WordsInput onWords={setWords} />
        </Show>

        <Show keyed={true} when={words()}>
          {w => <Tester words={w} />}
        </Show>
      </div>
    </div>
  );
};

export default App;
