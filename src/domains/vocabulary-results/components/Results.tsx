import { A } from '@solidjs/router';
import { createSignal, For, lazy, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import {
  TestWordStatus,
  type TestResult,
} from '~/domains/vocabulary-results/model/test-result-model';
import { ResultWordGuessesVisualisation } from './ResultWordGuessesVisualisation';
import { RESULT_COLORS } from '../model/colors';
import { groupBy } from 'lodash-es';

interface ResultsProps {
  results: TestResult;
  words: Word[];
  editWord: (word: Word) => void;
  onRepeatAll: () => void;
  onRepeat: (words: Word[]) => void;
}

const TestResultsVisualisation = lazy(
  () =>
    import('~/domains/vocabulary-results/components/TestResultsVisualisation')
);

export function Results(props: ResultsProps) {
  const [wordToEdit, setWordToEdit] = createSignal<Word>();
  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);

  const resultsMap = () =>
    new Map<TestWordStatus, TestResult['words']>(
      Object.entries(
        groupBy(
          props.results.words.filter(w => w.result != null),
          v => v.result
        )
      )
        .filter(([key, value]) => key != null && value.length > 0)
        .map(([key, value]) => [Number(key) as TestWordStatus, value])
    );

  const invalidWords = () =>
    props.results.words
      .filter(
        word => word.result != null && word.result >= TestWordStatus.Mediocre
      )
      .map(word => props.words.find(w => w.id === word.word_id)!);

  const feedbackText = () => {
    if (invalidWords().length === 0) {
      return 'You are awesome, you got all words right! 😍';
    }

    const averageResult =
      props.results.words.reduce((sum, word) => sum + (word.result ?? 0), 0) /
      props.results.words.length;

    if (averageResult <= TestWordStatus.Correct + 0.5) {
      return 'Great job! You are so close to perfection! 🚀';
    }

    if (averageResult <= TestWordStatus.Ok + 0.5) {
      return 'Good job! Keep practicing and you will be a ⭐!';
    }

    return "Not bad! Next time it's going to be better for sure! 💗";
  };

  function onWordEdited(word: Word) {
    props.editWord(word);
    setWordToEdit(undefined);
  }

  function onWordSelectionChange(newSelectedWords: Word[]) {
    setSelectedWords(newSelectedWords);
  }

  function onRepeatSelected() {
    props.onRepeat(selectedWords());
  }

  return (
    <div class="mx-auto flex flex-col">
      <WordEditorDialog
        word={wordToEdit()}
        open={wordToEdit() != null}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />

      <figure class="mx-auto">
        <div class="mx-auto w-40 lg:w-48">
          <TestResultsVisualisation result={props.results} />
          <div class="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm">
            <For each={Array.from(resultsMap().entries())}>
              {([result, words]) => (
                <div class="flex items-center gap-2">
                  <div
                    class="size-4 rounded-sm"
                    style={`background-color: ${RESULT_COLORS[result]};`}
                  ></div>
                  <span>
                    {words.length} {TestWordStatus[result]}
                  </span>
                </div>
              )}
            </For>
          </div>
        </div>
        <figcaption class="mt-8 text-lg">{feedbackText()}</figcaption>
      </figure>

      <div class="mx-auto mt-8 flex flex-wrap items-center justify-center gap-4 sm:mt-12">
        <Show when={invalidWords().length}>
          <Button
            class="btn-link"
            type="button"
            onClick={() => props.onRepeat(invalidWords())}
          >
            Practice incorrect
          </Button>
        </Show>
        <Button
          type="button"
          variant={invalidWords().length > 0 ? 'secondary' : 'default'}
          onClick={props.onRepeatAll}
        >
          Test all again
        </Button>
        <Show when={selectedWords().length > 0}>
          <Button
            type="button"
            variant="defaultOutline"
            onClick={onRepeatSelected}
          >
            Test selected ({selectedWords().length})
          </Button>
        </Show>
        <A class="text-sm text-primary" href="../..">
          Back to Vocabulary
        </A>
      </div>

      <section class="mx-auto mt-8" data-testid="results-word-breakdown">
        <h2 class="sr-only text-center">Word by word results breakdown</h2>
        <ResultWordGuessesVisualisation
          results={props.results}
          words={props.words}
          onSelectionChange={onWordSelectionChange}
        />
      </section>
    </div>
  );
}
