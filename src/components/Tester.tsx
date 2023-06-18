import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import { nextWord } from '../worder/worder';
import { Toggle } from './Toggle';

interface TesterProps {
  words: WordTranslation[];
  onAgain: () => void;
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
        setNextWord();
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

  function setNextWord() {
    const next = nextWord(wordsLeft(), reverse());

    if (!next) {
      return setCurrentWord(undefined);
    }

    setPeek(false);
    setCurrentWord(next[0]);
    setWordsLeft(w => w.filter((_, i) => i !== next[1]));
  }

  const done = () => wordsLeft()?.length === 0 && currentWord() == null;

  setNextWord();

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
      <Show when={currentWord() && !done()}>
        <button class="btn-primary block mx-auto" onClick={setNextWord}>
          Next
        </button>
        <div class="mt-20 flex justify-center">
          <Toggle
            label={<span class="text-slate-300">Reverse</span>}
            onChange={changeReverse}
          />
        </div>
      </Show>
      <Show when={done()}>
        <p class="text-center text-2xl">
          <i class="mr-4 text-green-600 font-semibold">✓</i>Done!
        </p>
        <button class="btn-primary block mx-auto mt-8" onClick={props.onAgain}>
          Again
        </button>
      </Show>
    </div>
  );
};

export default Tester;
