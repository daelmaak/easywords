import {
  HiOutlineEye,
  HiOutlinePencil,
  HiOutlineTrash,
  HiSolidInformationCircle,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show, createEffect, onCleanup, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import { Progress, ProgressValueLabel } from '~/components/ui/progress';
import type { VocabularyItem } from '~/domains/vocabularies/model/vocabulary-model';
import { nextWord } from '../../../worder/worder';
import { WriteTester } from './WriteTester';
import type { VocabularyTesterSettings } from './VocabularySettings';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { ConfirmationDialog } from '~/components/ConfirmationDialog';
import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';

export type VocabularyTestMode = 'guess' | 'write';

interface TesterProps {
  testSettings: VocabularyTesterSettings;
  words: VocabularyItem[];
  savedProgress?: TestResultWord[];
  onDone: (results: TestResultWord[]) => void;
  onEditWord: (word: VocabularyItem) => void;
  onRepeat: () => void;
  onReset: () => void;
  onProgress?: (results: TestResultWord[]) => void;
  onRemoveWord: (word: VocabularyItem) => void;
  onStop?: () => void;
}

interface State {
  currentWordId: number | undefined;
  peek: boolean;
  editing: boolean;
  wordsLeft: VocabularyItem[];
  resultWords: TestResultWord[];
}

export const VocabularyTester: Component<TesterProps> = (
  props: TesterProps
) => {
  const [store, setStore] = createStore<State>({
    wordsLeft: props.words,
    currentWordId: undefined,
    peek: false,
    editing: false,
    resultWords: props.words.map(w => ({
      id: w.id,
      done: false,
      invalidAttempts: 0,
      skipped: false,
    })),
  });

  let currentWordValid: boolean | undefined = undefined;

  const currentWord = () => props.words.find(w => w.id === store.currentWordId);

  const done = () => store.wordsLeft.length === 0;

  const toTranslate = () =>
    props.testSettings.reverseTranslations
      ? currentWord()?.translation
      : currentWord()?.original;

  const translatedWord = () => {
    const currWord = currentWord();
    if (currWord == null) {
      return undefined;
    }
    return {
      id: currWord.id,
      translation: props.testSettings.reverseTranslations
        ? currWord.original
        : currWord.translation,
    };
  };

  const percentageDone = () =>
    (1 - store.wordsLeft.length / props.words.length) * 100;

  createEffect(() => {
    if (!props.savedProgress) {
      return;
    }

    setStore({
      resultWords: props.savedProgress,
      wordsLeft: props.savedProgress
        .filter(sw => !sw.done)
        .map(sw => props.words.find(w => w.id === sw.id)!),
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
    props.onDone(store.resultWords);

    setStore({
      currentWordId: undefined,
      wordsLeft: [],
    });
  }

  function setNextWord() {
    const current = currentWord();
    let wsLeft = store.wordsLeft;

    // If last word and user in repeat invalid mode, just force her to
    // give the right answer.
    if (
      wsLeft.length === 1 &&
      currentWordValid === false &&
      props.testSettings.repeatInvalid
    ) {
      return;
    }

    if (current) {
      wsLeft = wsLeft.filter(w => w.id !== current.id);

      if (currentWordValid || !props.testSettings.repeatInvalid) {
        setStore('wordsLeft', wsLeft);
      }
      currentWordValid = undefined;
      props.onProgress?.(store.resultWords);
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

  function skip() {
    setStore(
      'resultWords',
      rws => rws.id === store.currentWordId,
      'skipped',
      true
    );
    setNextWord();
  }

  function onWordEdited(updatedWord: VocabularyItem) {
    setStore('editing', false);
    props.onEditWord(updatedWord);
  }

  function onWordValidated(valid: boolean) {
    setStore('peek', true);

    const resultWordIndex = store.resultWords.findIndex(
      rw => rw.id === currentWord()?.id
    );

    if (valid) {
      setStore('resultWords', resultWordIndex, 'done', true);
    } else {
      setStore('resultWords', resultWordIndex, 'invalidAttempts', a => a + 1);
    }

    if (currentWordValid == null || store.wordsLeft.length === 1) {
      currentWordValid = valid;
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
          <ConfirmationDialog
            trigger={
              <Button
                aria-label="Delete word from vocabulary"
                class="translate-y-[1px] opacity-60"
                title="Delete word from vocabulary"
                size="icon"
                variant="ghost"
                type="button"
              >
                <HiOutlineTrash size={20} />
              </Button>
            }
            confirmText="Delete word"
            onConfirm={removeWord}
          />
          <Button
            aria-label="Edit word"
            class="translate-y-[1px] opacity-60"
            title="Edit word"
            size="icon"
            variant="ghost"
            type="button"
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
            type="button"
            onClick={togglePeek}
          >
            <HiOutlineEye size={20} />
          </Button>
        </div>

        <WordEditorDialog
          word={currentWord()}
          open={store.editing}
          onClose={() => setStore('editing', false)}
          onWordEdited={onWordEdited}
        />

        {/* mb-[-0.5rem] is here to bypass the vertical flex gap */}
        <div class="mb-[-0.5rem] flex items-center">
          <span data-testid="original-to-translate">{toTranslate()}</span>
          <Show when={currentWord()?.notes}>
            {notes => (
              <Popover>
                <PopoverTrigger class="size-8 flex justify-center items-center">
                  <HiSolidInformationCircle
                    aria-label="Show notes"
                    class="text-blue-600 hover:text-blue-900"
                    title="Show notes"
                    size={20}
                  />
                </PopoverTrigger>
                <PopoverContent>{notes()}</PopoverContent>
              </Popover>
            )}
          </Show>
        </div>
        <Show when={translatedWord()}>
          {word =>
            props.testSettings.mode === 'write' ? (
              <WriteTester
                autoFocus
                mode="full"
                peek={store.peek}
                strict={props.testSettings.strictMatch}
                word={word()}
                onDone={setNextWord}
                onSkip={skip}
                onValidated={onWordValidated}
              />
            ) : (
              <span class="text-left" classList={{ invisible: !store.peek }}>
                {word().translation}
              </span>
            )
          }
        </Show>
      </div>

      <Show when={currentWord() && !done()}>
        <div class="mt-6 flex justify-center gap-4 sm:mt-12">
          <Show when={props.testSettings.mode === 'guess'}>
            <Button onClick={setNextWord}>Next</Button>
          </Show>
          <Button class="btn-link" variant="outline" onClick={props.onStop}>
            Pause test
          </Button>
          <Button class="btn-link" variant="outline" onClick={finish}>
            Finish test
          </Button>
        </div>
      </Show>

      <Progress
        aria-label="Words done progress"
        class="my-6 mx-auto w-full sm:mt-20"
        value={percentageDone()}
        getValueLabel={() =>
          `${props.words.length - store.wordsLeft.length} out of ${
            props.words.length
          } done`
        }
      >
        <div class="text-center">
          <ProgressValueLabel />
        </div>
      </Progress>
    </>
  );
};
