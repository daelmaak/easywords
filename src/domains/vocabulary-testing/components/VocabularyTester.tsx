import {
  type Component,
  Show,
  createEffect,
  createSignal,
  onCleanup,
} from 'solid-js';
import { WordTranslation } from '~/model/word-translation';
import { mergeWords } from '../../../util/merge-arrays';
import { nextWord } from '../../../worder/worder';
import { WriteTester } from './WriteTester';
import { Button } from '~/components/ui/button';
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'solid-icons/hi';
import {
  Progress,
  ProgressLabel,
  ProgressValueLabel,
} from '~/components/ui/progress';

export type VocabularyTestMode = 'guess' | 'write';

interface TesterProps {
  repeatInvalid: boolean;
  reverse: boolean;
  words: WordTranslation[];
  mode: VocabularyTestMode;
  done: (
    leftoverWords?: WordTranslation[],
    removedWords?: WordTranslation[]
  ) => void;
  repeat: () => void;
  reset: () => void;
}

export const VocabularyTester: Component<TesterProps> = (
  props: TesterProps
) => {
  const [wordsLeft, setWordsLeft] = createSignal<WordTranslation[]>(
    props.words
  );
  const [currentWord, setCurrentWord] = createSignal<
    WordTranslation | undefined
  >();
  const [peek, setPeek] = createSignal(false);

  let invalidWords: WordTranslation[] = [];
  let removedWords: WordTranslation[] = [];
  let currentWordValid: boolean | undefined = undefined;

  const done = () => wordsLeft().length === 0;

  const toTranslate = () =>
    props.reverse ? currentWord()?.translation : currentWord()?.original;
  const translated = () =>
    props.reverse ? currentWord()?.original : currentWord()?.translation;

  const percentageDone = () =>
    (1 - wordsLeft().length / props.words.length) * 100;

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
    props.done(invalidAndLeftoverWords, removedWords);

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

  function removeWord() {
    const word = currentWord();

    if (!word) {
      return;
    }
    removedWords.push(word);
    setWordsLeft(wordsLeft().filter(w => w.original !== word.original));
    setNextWord();
  }

  function togglePeek() {
    setPeek(!peek());
  }

  setNextWord();

  return (
    <>
      <div
        class="flex flex-wrap flex-col justify-center items-center gap-4 sm:flex-nowrap text-2xl"
        classList={{ invisible: !currentWord() }}
      >
        <div class="flex items-center justify-end">
          <Button
            class="translate-y-[1px] opacity-60"
            title="Remove word from vocabulary"
            size="icon"
            variant="ghost"
            onClick={removeWord}
          >
            <HiOutlineTrash size={20} />
          </Button>
          <Button
            class="translate-y-[1px] opacity-60"
            title="Peek"
            size="icon"
            variant="ghost"
            onClick={togglePeek}
          >
            <HiOutlinePencil size={20} />
          </Button>
          <Button
            class="mr-2 translate-y-[1px] opacity-60"
            title="Peek"
            size="icon"
            variant="ghost"
            onClick={togglePeek}
          >
            <HiOutlineEye size={20} />
          </Button>
        </div>
        <div>{toTranslate()}</div>
        {props.mode === 'write' ? (
          <Show when={translated() != null}>
            <WriteTester
              autoFocus
              peek={peek()}
              translation={translated()!}
              onDone={setNextWord}
              onPeek={() => setPeek(true)}
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
        <div class="mt-12 flex justify-center gap-4">
          <Button class="btn-primary" variant="outline" onClick={setNextWord}>
            Next
          </Button>
          <Button class="btn-link" variant="outline" onClick={finish}>
            Finish test
          </Button>
        </div>
      </Show>

      <Progress
        value={percentageDone()}
        aria-label="Words done percentage"
        class="mt-20 mx-auto w-full"
        getValueLabel={({ value }) => `${Math.round(value)}% done`}
      >
        <div class="text-center">
          <ProgressValueLabel />
        </div>
      </Progress>
    </>
  );
};
