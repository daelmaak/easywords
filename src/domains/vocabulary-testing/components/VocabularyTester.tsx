import {
  HiOutlineArchiveBox,
  HiOutlineEye,
  HiOutlinePencil,
  HiSolidInformationCircle,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Match, Show, Switch } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Progress, ProgressValueLabel } from '~/components/ui/progress';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import type {
  TestResult,
  TestResultToCreate,
  TestResultWord,
} from '~/domains/vocabulary-results/model/test-result-model';
import { TestWordStatus } from '~/domains/vocabulary-results/model/test-result-model';
import { nextWord } from '../../../worder/worder';
import { GuessTester } from './GuessTester';
import type { VocabularyTesterSettings } from './VocabularySettings';
import { WriteTester } from './WriteTester';

export type VocabularyTestMode = 'guess' | 'write';

interface TesterProps {
  testSettings: VocabularyTesterSettings;
  vocabularyId: number;
  words: Word[];
  testProgress: TestResult;
  onDone: (result: TestResult) => void;
  onEditWord: (word: Word) => void;
  onProgress?: (results: TestResultToCreate) => void;
  onArchiveWord: (word: Word) => void;
  onStop?: () => void;
}

interface State {
  currentWordId: number | undefined;
  peek: boolean;
  editing: boolean;
  resultWords: TestResultWord[];
}

export const VocabularyTester: Component<TesterProps> = (
  props: TesterProps
) => {
  const [store, setStore] = createStore<State>({
    currentWordId: undefined,
    peek: false,
    editing: false,
    resultWords: props.testProgress.words,
  });

  const currentWord = () => props.words.find(w => w.id === store.currentWordId);

  const wordsLeft = () => props.testProgress.words.filter(w => !w.done);

  const done = () => wordsLeft().length === 0;

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
    (1 - wordsLeft().length / props.words.length) * 100;

  function finish() {
    props.onDone({
      ...props.testProgress,
      done: true,
      vocabulary_id: props.vocabularyId,
      words: store.resultWords,
    });

    setStore({
      currentWordId: undefined,
    });
  }

  function markProgress() {
    props.onProgress?.({
      ...props.testProgress,
      done: false,
      vocabulary_id: props.vocabularyId,
      words: store.resultWords,
    });
  }

  function setNextWord() {
    const current = currentWord();
    const wsLeft = wordsLeft();

    const next = nextWord(wsLeft);

    if (next == null) {
      return finish();
    }

    if (current && next) {
      markProgress();
    }

    setStore({
      currentWordId: next.word_id,
      peek: false,
    });
  }

  function skip() {
    if (!props.testSettings.repeatInvalid) {
      setStore(
        'resultWords',
        rws => rws.word_id === store.currentWordId,
        'done',
        true
      );
    }
    setNextWord();
  }

  function onGuessResult(correctness: TestWordStatus) {
    const resultWordIndex = store.resultWords.findIndex(
      rw => rw.word_id === currentWord()?.id
    );

    const isValid = correctness === TestWordStatus.Correct;

    setStore('resultWords', resultWordIndex, rw => {
      const newAttempts = [...rw.attempts!, correctness];
      const averageCorrectness = Math.round(
        newAttempts.reduce((sum, attempt) => sum + attempt, 0) /
          newAttempts.length
      );

      const isDone = !props.testSettings.repeatInvalid || isValid;

      return {
        ...rw,
        result: averageCorrectness as TestWordStatus,
        done: isDone,
        attempts: newAttempts,
      };
    });

    setNextWord();
  }

  function onWordEdited(updatedWord: Word) {
    setStore('editing', false);
    props.onEditWord(updatedWord);
  }

  function onWordValidated(valid: boolean) {
    setStore('peek', true);

    const resultWordIndex = store.resultWords.findIndex(
      rw => rw.word_id === currentWord()?.id
    );

    if (valid) {
      setStore('resultWords', resultWordIndex, rw => ({
        ...rw,
        result: TestWordStatus.Correct,
        attempts: [...rw.attempts!, TestWordStatus.Correct],
        done: true,
      }));
    } else {
      setStore('resultWords', resultWordIndex, rw => ({
        ...rw,
        attempts: [...rw.attempts!, TestWordStatus.Wrong],
        result: TestWordStatus.Wrong,
        done: !props.testSettings.repeatInvalid,
      }));
    }
  }

  function archiveWord() {
    const word = currentWord();

    if (!word) {
      return;
    }

    props.onArchiveWord(word);

    setStore('resultWords', rw => rw.filter(w => w.word_id !== word.id));

    const filteredResults = store.resultWords.filter(
      rw => rw.word_id !== word.id
    );
    setStore({
      peek: false,
      resultWords: filteredResults,
    });
    markProgress();

    setNextWord();
  }

  function togglePeek() {
    setStore('peek', peek => !peek);
  }

  setNextWord();

  return (
    <>
      <div
        class="flex flex-col flex-wrap items-center justify-center gap-4 text-2xl sm:flex-nowrap"
        classList={{ invisible: !currentWord() }}
      >
        <div class="flex items-center justify-end">
          <Show when={!currentWord()?.archived}>
            <Button
              aria-label="Archive word"
              class="translate-y-[1px] opacity-60"
              title="Archive word"
              size="icon"
              variant="ghost"
              type="button"
              onClick={archiveWord}
            >
              <HiOutlineArchiveBox size={20} />
            </Button>
          </Show>
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
          <Show when={props.testSettings.mode === 'write'}>
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
          </Show>
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
                <PopoverTrigger class="flex size-8 items-center justify-center">
                  <HiSolidInformationCircle
                    aria-label="Show notes"
                    class="text-blue-600 hover:text-blue-900"
                    title="Show notes"
                    size={20}
                  />
                </PopoverTrigger>
                <PopoverContent class="whitespace-pre-wrap">
                  {notes()}
                </PopoverContent>
              </Popover>
            )}
          </Show>
        </div>
        <Show when={translatedWord()}>
          {word => (
            <Switch>
              <Match when={props.testSettings.mode === 'write'}>
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
              </Match>
              <Match when={props.testSettings.mode === 'guess'}>
                <GuessTester
                  translation={word().translation}
                  onDone={onGuessResult}
                />
              </Match>
            </Switch>
          )}
        </Show>
      </div>

      <Show when={currentWord() && !done()}>
        <div class="mt-6 flex justify-center gap-4 sm:mt-12">
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
        class="mx-auto my-6 w-full max-w-96 sm:mt-20 sm:w-80"
        value={percentageDone()}
        getValueLabel={() =>
          `${props.words.length - wordsLeft().length} out of ${
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
