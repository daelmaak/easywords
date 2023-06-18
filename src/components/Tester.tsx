import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import { nextWord } from '../worder/worder';
import { Toggle } from './Toggle';

interface TesterProps {
  words: WordTranslation[];
}

const Tester = (props: TesterProps) => {
  const [wordsLeft, setWordsLeft] = createSignal<WordTranslation[]>(
    props.words
  );
  const [currentWord, setCurrentWord] = createSignal<
    WordTranslation | undefined
  >();
  const [peek, setPeek] = createSignal(false);
  const [reverse, setReverse] = createSignal(false);

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

  function changeReverse(reverse: boolean) {
    setReverse(reverse);

    const currWord = currentWord();

    if (currWord) {
      setCurrentWord({
        original: currWord.translation,
        translation: currWord.original,
      });
    }
  }

  function next() {
    const [word, index] = nextWord(wordsLeft(), reverse());

    setPeek(false);
    setCurrentWord(word);
    setWordsLeft(w => w.filter((_, i) => i !== index));
  }

  const done = () => wordsLeft()?.length === 0;

  next();

  return (
    <div>
      <div
        class="grid grid-cols-[1fr_2rem_1fr] mb-8 text-2xl"
        classList={{ invisible: !currentWord() }}
      >
        <span class="whitespace-nowrap text-right">
          <button class="text-md mr-2 btn-link" onClick={() => setPeek(true)}>
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
      <div class="mt-20 flex justify-center">
        <Toggle
          label={<span class="text-slate-300">Reverse</span>}
          onChange={changeReverse}
        />
      </div>
    </div>
  );
};

export default Tester;
