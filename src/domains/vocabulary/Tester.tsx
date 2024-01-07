import { Show, createEffect, createSignal, onCleanup } from 'solid-js';
import { Progress } from '../../components/Progress';
import { WordTranslation } from '../../parser/simple-md-parser';
import { mergeWords } from '../../util/merge-arrays';
import { nextWord } from '../../worder/worder';
import { WriteTester } from './WriteTester';

export type VocabularyTestMode = 'guess' | 'write';

interface TesterProps {
  repeatInvalid: boolean;
  reverse: boolean;
  words: WordTranslation[];
  mode: VocabularyTestMode;
  done: (leftoverWords?: WordTranslation[]) => void;
  repeat: () => void;
  reset: () => void;
}

export const VocabularyTester = (props: TesterProps) => {
  const [wordsLeft, setWordsLeft] = createSignal<WordTranslation[]>(
    props.words
  );
  const [currentWord, setCurrentWord] = createSignal<
    WordTranslation | undefined
  >();
  const [peek, setPeek] = createSignal(false);
  let invalidWords: WordTranslation[] = [];
  let currentWordValid: boolean | undefined = undefined;

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

    // only one last word, looking up next doesn't make sense
    if (wsLeft.length === 1 && currentWordValid === false) {
      return;
    }

    if (current) {
      wsLeft = wsLeft.filter(w => w.original !== current.original);

      if (currentWordValid || !props.repeatInvalid) {
        setWordsLeft(wsLeft);
      }
      currentWordValid = undefined;
    }

    const next = nextWord(wsLeft);

    if (!next) {
      return finish();
    }

    setPeek(false);
    setCurrentWord(next);
  }

  function finish() {
    const invalidAndLeftoverWords = mergeWords(invalidWords, wordsLeft());
    props.done(invalidAndLeftoverWords);

    setCurrentWord();
    setWordsLeft([]);
    invalidWords = [];
  }

  function onWordValidated(valid: boolean) {
    if (valid) {
      // Just make sure the user sees the correct translations, because maybe she
      // guessed only one of the words that are in the translation.
      setPeek(true);
    }

    if (currentWordValid == null || wordsLeft().length === 1) {
      currentWordValid = valid;
    }

    const word = currentWord();

    if (
      !valid &&
      word &&
      // TODO: @daelmaak not very performant is it? Optimize
      invalidWords.every(w => w.original !== word.original)
    ) {
      invalidWords.push(word);
    }
  }

  function togglePeek() {
    setPeek(!peek());
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
        <span class="text-right">
          <button class="text-md mr-2 btn-link" onClick={togglePeek}>
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
              onDone={setNextWord}
              onPeek={() => setPeek(true)}
              onReady={el => el.focus()}
              onValidated={onWordValidated}
            />
          </Show>
        ) : (
          <span class="text-left" classList={{ invisible: !peek() }}>
            {translated()}
          </span>
        )}
      </div>
      <Show when={currentWord() && !done()}>
        <div class="flex justify-center gap-4">
          <button class="btn-primary" onClick={setNextWord}>
            Next
          </button>
          <button class="btn-link" onClick={finish}>
            Finish
          </button>
        </div>
      </Show>

      <Progress
        percentage={percentageDone()}
        ariaLabel="Words done percentage"
        class="mt-20 mx-auto w-80"
      />
    </div>
  );
};
