import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'solid-icons/hi';
import { Component, Show, createEffect, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import { Progress, ProgressValueLabel } from '~/components/ui/progress';
import { WordTranslation } from '~/model/word-translation';
import { mergeWords } from '../../../util/merge-arrays';
import { nextWord } from '../../../worder/worder';
import { WriteTester } from './WriteTester';

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

interface State {
  wordsLeft: WordTranslation[];
  currentWord: WordTranslation | undefined;
  peek: boolean;
  editing: boolean;
}

export const VocabularyTester: Component<TesterProps> = (
  props: TesterProps
) => {
  const [store, setStore] = createStore<State>({
    wordsLeft: props.words,
    currentWord: undefined,
    peek: false,
    editing: false,
  });

  let invalidWords: WordTranslation[] = [];
  let removedWords: WordTranslation[] = [];
  let currentWordValid: boolean | undefined = undefined;

  const done = () => store.wordsLeft.length === 0;

  const toTranslate = () =>
    props.reverse
      ? store.currentWord?.translation
      : store.currentWord?.original;
  const translated = () =>
    props.reverse
      ? store.currentWord?.original
      : store.currentWord?.translation;

  const percentageDone = () =>
    (1 - store.wordsLeft.length / props.words.length) * 100;

  createEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (props.mode !== 'guess') {
        return;
      }
      if (e.key === 'r') {
        setStore('peek', true);
      }
      if (e.key === 'n') {
        setNextWord();
      }
    };

    document.addEventListener('keydown', onKey);
    onCleanup(() => document.removeEventListener('keydown', onKey));
  });

  function setNextWord() {
    const current = store.currentWord;
    let wsLeft = store.wordsLeft;

    // only one last word, looking up next doesn't make sense
    if (wsLeft.length === 1 && currentWordValid === false) {
      return;
    }

    if (current) {
      wsLeft = wsLeft.filter(w => w.original !== current.original);

      if (currentWordValid || !props.repeatInvalid) {
        setStore('wordsLeft', wsLeft);
      }
      currentWordValid = undefined;
    }

    const next = nextWord(wsLeft);

    if (!next) {
      return finish();
    }

    setStore({
      currentWord: next,
      peek: false,
    });
  }

  function finish() {
    const invalidAndLeftoverWords = mergeWords(invalidWords, store.wordsLeft);
    props.done(invalidAndLeftoverWords, removedWords);

    setStore({
      currentWord: undefined,
      wordsLeft: [],
    });
    invalidWords = [];
  }

  function onWordValidated(valid: boolean) {
    if (valid) {
      // Just make sure the user sees the correct translations, because maybe she
      // guessed only one of the words that are in the translation.
      setStore('peek', true);
    }

    if (currentWordValid == null || store.wordsLeft.length === 1) {
      currentWordValid = valid;
    }

    const word = store.currentWord;

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
    const word = store.currentWord;

    if (!word) {
      return;
    }
    removedWords.push(word);

    setStore('wordsLeft', wl => wl.filter(w => w.original !== word.original));
    setNextWord();
  }

  function togglePeek() {
    setStore('peek', peek => !peek);
  }

  setNextWord();

  return (
    <>
      <div
        class="flex flex-wrap flex-col justify-center items-center gap-4 sm:flex-nowrap text-2xl"
        classList={{ invisible: !store.currentWord }}
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
              peek={store.peek}
              translation={translated()!}
              onDone={setNextWord}
              onPeek={() => setStore('peek', true)}
              onValidated={onWordValidated}
            />
          </Show>
        ) : (
          <span class="text-left" classList={{ invisible: !store.peek }}>
            {translated()}
          </span>
        )}
      </div>
      <Show when={store.currentWord && !done()}>
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
        aria-label="Words done percentage"
        class="mt-20 mx-auto w-full"
        value={percentageDone()}
        getValueLabel={({ value }) => `${Math.round(value)}% done`}
      >
        <div class="text-center">
          <ProgressValueLabel />
        </div>
      </Progress>
    </>
  );
};
