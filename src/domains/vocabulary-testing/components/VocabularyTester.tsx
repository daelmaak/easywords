import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from 'solid-icons/hi';
import { Component, Show, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent } from '~/components/ui/dialog';
import { Progress, ProgressValueLabel } from '~/components/ui/progress';
import { WordCreator } from '~/domains/vocabularies/components/WordCreator';
import { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';
import { mergeWords } from '../../../util/merge-arrays';
import { nextWord } from '../../../worder/worder';
import { SavedProgress } from '../vocabulary-testing-model';
import { WriteTester } from './WriteTester';
import { VocabularyTesterSettings } from './VocabularySettings';

export type VocabularyTestMode = 'guess' | 'write';

interface TesterProps {
  testSettings: VocabularyTesterSettings;
  words: VocabularyItem[];
  savedProgress?: SavedProgress;
  onDone: (leftoverWords?: VocabularyItem[]) => void;
  onEditWord: (word: VocabularyItem) => void;
  onRepeat: () => void;
  onReset: () => void;
  onProgress?: (progress: SavedProgress) => void;
  onRemoveWord: (word: VocabularyItem) => void;
  onStop?: () => void;
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

  let currentWordValid: boolean | undefined = undefined;

  const currentWord = () => props.words.find(w => w.id === store.currentWordId);

  const done = () => store.wordsLeft.length === 0;

  const toTranslate = () =>
    props.testSettings.reverseTranslations
      ? currentWord()?.translation
      : currentWord()?.original;
  const translated = () =>
    props.testSettings.reverseTranslations
      ? currentWord()?.original
      : currentWord()?.translation;

  const percentageDone = () =>
    (1 - store.wordsLeft.length / props.words.length) * 100;

  const progress = (): SavedProgress => ({
    leftOverWords: store.wordsLeft,
    invalidWords: store.invalidWords,
  });

  onMount(() => {
    if (!props.savedProgress) {
      return;
    }

    setStore({
      wordsLeft: props.savedProgress.leftOverWords,
      invalidWords: props.savedProgress.invalidWords,
    });
  });

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (props.testSettings.mode !== 'guess') {
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

  function finish() {
    const invalidAndLeftoverWords = mergeWords(
      store.invalidWords,
      store.wordsLeft
    );
    props.onDone(invalidAndLeftoverWords);

    setStore({
      currentWordId: undefined,
      wordsLeft: [],
      invalidWords: [],
    });
  }

  function setNextWord() {
    const current = currentWord();
    let wsLeft = store.wordsLeft;

    // only one last word, looking up next doesn't make sense
    if (wsLeft.length === 1 && currentWordValid === false) {
      return;
    }

    if (current) {
      wsLeft = wsLeft.filter(w => w.original !== current.original);

      if (currentWordValid || !props.testSettings.repeatInvalid) {
        setStore('wordsLeft', wsLeft);
      }
      currentWordValid = undefined;
      props.onProgress?.(progress());
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

    props.onEditWord(updatedWord);
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

    props.onRemoveWord(word);

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

        {/* mb-[-0.5rem] is here to bypass the vertical flex gap */}
        <div class="mb-[-0.5rem]">{toTranslate()}</div>

        {props.testSettings.mode === 'write' ? (
          <Show when={translated() != null}>
            <WriteTester
              autoFocus
              mode="full"
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
          <Show when={props.testSettings.mode === 'guess'}>
            <Button onClick={setNextWord}>Next</Button>
          </Show>
          <Button class="btn-link" variant="outline" onClick={props.onStop}>
            Stop test
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
