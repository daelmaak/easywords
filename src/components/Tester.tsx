import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import { nextWord } from '../worder/worder';

interface TesterProps {
  words: WordTranslation[];
}

const Tester = (props: TesterProps) => {
  const [wordsLeft, setWordsLeft] = createSignal<WordTranslation[]>(
    props.words
  );
  const [currentWord, setCurrentWord] = createSignal<WordTranslation>();
  const [peek, setPeek] = createSignal(false);

  function next() {
    const [word, index] = nextWord(wordsLeft());

    setPeek(false);
    setCurrentWord(word);
    setWordsLeft(w => w.filter((_, i) => i !== index));
  }

  const done = () => wordsLeft()?.length === 0;

  createEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'r') {
        setPeek(true);
      }
      if (e.key === 'n') {
        next();
      }
    };

    document.addEventListener('keydown', onKey);
    onCleanup(() => document.removeEventListener('keydown', onKey));
  });

  next();

  return (
    <div>
      <div
        class="grid grid-cols-[1fr_2rem_1fr] mb-8 text-2xl"
        classList={{ invisible: !currentWord() }}
      >
        <span class="whitespace-nowrap text-right">
          <button class="text-md mr-2 link" onClick={() => setPeek(true)}>
            👁
          </button>
          {currentWord()?.original}
        </span>
        <span class="text-center text-slate-500">|</span>
        <span
          class="whitespace-nowrap text-left"
          classList={{ invisible: !peek() }}
        >
          {currentWord()?.translation}
        </span>
      </div>
      <Show when={currentWord() && !done()} fallback={done() && 'done!'}>
        <button class="btn-primary block mx-auto" onClick={next}>
          Next
        </button>
      </Show>
    </div>
  );
};

export default Tester;
