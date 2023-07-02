import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { WordTranslation } from '../parser/simple-md-parser';
import { nextWord } from '../worder/worder';
import { WriteTester } from './WriteTester';
import { Progress } from './Progress';

export type TestMode = 'guess' | 'write';

interface TesterProps {
  reverse: boolean;
  words: WordTranslation[];
  mode: TestMode;
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
  let currentWordMistake = false;

  createEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (props.mode !== 'guess') {
        return;
      }
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

  function setNextWord() {
    const current = currentWord();
    let wsLeft = wordsLeft();

    if (current) {
      wsLeft = wsLeft.filter(w => w.original !== current.original);

      // I check the lenght because it means user would get the last word twice
      // which doesn't make sense even though he made a mistake.
      if (!currentWordMistake || wsLeft.length === 0) {
        setWordsLeft(wsLeft);
      }
      currentWordMistake = false;
    }

    const next = nextWord(wsLeft);

    if (!next) {
      return setCurrentWord(undefined);
    }

    setPeek(false);
    setCurrentWord(next);
  }

  setNextWord();

  const done = () => wordsLeft().length === 0;

  const toTranslate = () =>
    props.reverse ? currentWord()?.translation : currentWord()?.original;
  const translated = () =>
    props.reverse ? currentWord()?.original : currentWord()?.translation;

  const percentageDone = () =>
    (1 - wordsLeft().length / props.words.length) * 100;

  return (
    <div>
      <div
        class="mb-8 grid grid-cols-[1fr_2rem_1fr] items-center text-2xl"
        classList={{ invisible: !currentWord() }}
      >
        <span class="whitespace-nowrap text-right">
          <button
            class="text-md mr-2 btn-link"
            onClick={() => setPeek(!peek())}
          >
            👁
          </button>
          {toTranslate()}
        </span>
        <span class="text-center text-slate-500">|</span>
        {props.mode === 'write' ? (
          <Show when={translated() != null}>
            <WriteTester
              peek={peek()}
              translation={translated()!}
              onMistake={() => (currentWordMistake = true)}
              onNextWord={setNextWord}
            />
          </Show>
        ) : (
          <span
            class="whitespace-nowrap text-left"
            classList={{ invisible: !peek() }}
          >
            {translated()}
          </span>
        )}
      </div>
      <Show when={currentWord() && !done()}>
        <button class="btn-primary block mx-auto" onClick={setNextWord}>
          Next
        </button>
      </Show>
      <Show when={done()}>
        <p class="text-center text-2xl">
          <i class="mr-4 text-green-600 font-semibold">✓</i>Done!
        </p>
        <button class="btn-primary block mx-auto mt-8" onClick={props.onAgain}>
          Again
        </button>
      </Show>
      <Progress
        percentage={percentageDone()}
        ariaLabel="Words done percentage"
        class="mt-20 mx-auto w-80"
      />
    </div>
  );
};

export default Tester;
