import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'solid-icons/hi';
import { Component, Show, createEffect, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Progress, ProgressValueLabel } from '~/components/ui/progress';
import { WordCreator } from '~/domains/vocabularies/components/WordCreator';
import { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';
import { mergeWords } from '../../../util/merge-arrays';
import { nextWord } from '../../../worder/worder';
import { WriteTester } from './WriteTester';
import { SavedProgress } from '../vocabulary-testing-model';

export type VocabularyTestMode = 'guess' | 'write';

interface TesterProps {
  repeatInvalid: boolean;
  reverse: boolean;
  words: VocabularyItem[];
  mode: VocabularyTestMode;
  savedProgress?: SavedProgress;
  done: (
    leftoverWords?: VocabularyItem[],
    removedWords?: VocabularyItem[]
  ) => void;
  editWord: (word: VocabularyItem) => void;
  repeat: () => void;
  reset: () => void;
  onSaveProgress?: (progress: SavedProgress) => void;
}

interface State {
  wordsLeft: VocabularyItem[];
  currentWordId: number | undefined;
  peek: boolean;
  editing: boolean;
  invalidWords: VocabularyItem[];
}

export const VocabularyTester: Component<TesterProps> = (
  props: TesterProps
) => {
  const [store, setStore] = createStore<State>({
    wordsLeft: props.words,
    currentWordId: undefined,
    peek: false,
    editing: false,
    invalidWords: [],
  });

  let removedWords: VocabularyItem[] = [];
  let currentWordValid: boolean | undefined = undefined;

  const currentWord = () => props.words.find(w => w.id === store.currentWordId);

  const done = () => store.wordsLeft.length === 0;

  const toTranslate = () =>
    props.reverse ? currentWord()?.translation : currentWord()?.original;
  const translated = () =>
    props.reverse ? currentWord()?.original : currentWord()?.translation;

  const percentageDone = () =>
    (1 - store.wordsLeft.length / props.words.length) * 100;

  createEffect(() => {
    if (!props.savedProgress) {
      return;
    }

    setStore({
      wordsLeft: props.savedProgress.leftOverWords,
      invalidWords: props.savedProgress.invalidWords,
    });
  });

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
    const current = currentWord();
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
      currentWordId: next.id,
      peek: false,
    });
  }

  function finish() {
    const invalidAndLeftoverWords = mergeWords(
      store.invalidWords,
      store.wordsLeft
    );
    props.done(invalidAndLeftoverWords, removedWords);

    setStore({
      currentWordId: undefined,
      wordsLeft: [],
      invalidWords: [],
    });
  }

  function saveProgress() {
    props.onSaveProgress?.({
      invalidWords: store.invalidWords,
      leftOverWords: store.wordsLeft,
    });
  }

  function onEditWord(original: string, translation: string) {
    setStore('editing', false);

    const word = currentWord();

    if (!word) {
      return;
    }

    const updatedWord = {
      ...word,
      original,
      translation,
    } satisfies VocabularyItem;

    props.editWord(updatedWord);
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

    const word = currentWord();

    if (
      !valid &&
      word &&
      // TODO: @daelmaak not very performant is it? Optimize
      store.invalidWords.every(w => w.original !== word.original)
    ) {
      // https://docs.solidjs.com/concepts/stores#appending-new-values
      setStore('invalidWords', store.invalidWords.length, word);
    }
  }

  function removeWord() {
    const word = currentWord();

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
        classList={{ invisible: !currentWord() }}
      >
        <div class="flex items-center justify-end">
          <Button
            aria-label="Remove word from vocabulary"
            class="translate-y-[1px] opacity-60"
            title="Remove word from vocabulary"
            size="icon"
            variant="ghost"
            onClick={removeWord}
          >
            <HiOutlineTrash size={20} />
          </Button>
          <Button
            aria-label="Edit word"
            class="translate-y-[1px] opacity-60"
            title="Peek"
            size="icon"
            variant="ghost"
            onClick={() => setStore('editing', !store.editing)}
          >
            <HiOutlinePencil size={20} />
          </Button>
          <Button
            aria-label="Reveal translation"
            class="mr-2 translate-y-[1px] opacity-60"
            title="Peek"
            size="icon"
            variant="ghost"
            onClick={togglePeek}
          >
            <HiOutlineEye size={20} />
          </Button>
        </div>

        <Dialog
          open={store.editing}
          onOpenChange={open => setStore('editing', open)}
        >
          <DialogContent class="w-svw sm:w-[30rem]">
            <h2 class="text-lg font-bold mb-4">Edit word</h2>
            <WordCreator
              ctaLabel="Update"
              value={currentWord()}
              onChange={onEditWord}
            />
          </DialogContent>
        </Dialog>

        <div>{toTranslate()}</div>

        {props.mode === 'write' ? (
          <Show when={translated() != null}>
            <WriteTester
              autoFocus
              peek={store.peek}
              translation={translated()!}
              onDone={setNextWord}
              onPeek={() => setStore('peek', true)}
              onSkip={setNextWord}
              onValidated={onWordValidated}
            />
          </Show>
        ) : (
          <span class="text-left" classList={{ invisible: !store.peek }}>
            {translated()}
          </span>
        )}
      </div>
      <Show when={currentWord() && !done()}>
        <div class="mt-6 flex justify-center gap-4 sm:mt-12">
          <Show when={props.mode === 'guess'}>
            <Button onClick={setNextWord}>Next</Button>
          </Show>
          <Button class="btn-link" variant="outline" onClick={saveProgress}>
            Save Progress
          </Button>
          <Button class="btn-link" variant="outline" onClick={finish}>
            Finish test
          </Button>
        </div>
      </Show>

      <Progress
        aria-label="Words done percentage"
        class="mt-6 sm:mt-20 mx-auto w-full"
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
