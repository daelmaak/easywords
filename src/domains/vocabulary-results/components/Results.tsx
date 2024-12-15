import { createSignal, For, lazy, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import { WordEditorDialog } from '~/domains/vocabularies/components/WordEditorDialog';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import type { PreviousWordResult } from '~/domains/vocabulary-results/model/test-result-model';
import {
  TestWordStatus,
  type TestResult,
} from '~/domains/vocabulary-results/model/test-result-model';
import { ResultGuessesBreakdown } from './ResultGuessesBreakdown';
import { RESULT_COLORS } from '../model/colors';
import { groupBy } from 'lodash-es';
import { Card, CardContent } from '~/components/ui/card';
import { TEST_RESULT_LABELS } from '../model/labels';
import { ResultsComparisonScore } from './ResultsComparisonScore';
import { ResultsComparisonBreakdown } from './ResultsComparisonBreakdown';

interface ResultsProps {
  results: TestResult;
  previousWordResults?: PreviousWordResult[];
  words: Word[];
  editWord: (word: Word) => void;
  onArchive: (words: Word[]) => void;
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
      .filter(word => word.result != null && word.result >= TestWordStatus.Fair)
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

    if (averageResult <= TestWordStatus.Good + 0.5) {
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

  function onArchiveSelected() {
    props.onArchive(selectedWords());
  }

  return (
    <div class="mx-auto flex flex-col">
      <WordEditorDialog
        word={wordToEdit()}
        open={wordToEdit() != null}
        onClose={() => setWordToEdit(undefined)}
        onWordEdited={onWordEdited}
      />

      <p class="mx-auto my-4 text-lg">{feedbackText()}</p>

      <div class="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[1fr_1fr] md:p-4 lg:grid-cols-[6fr_9fr_auto]">
        <div>
          <Card>
            <CardContent class="p-4">
              <div class="mx-auto w-full max-w-64">
                <TestResultsVisualisation result={props.results} />
              </div>
              <ul class="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-2 text-sm">
                <For each={Array.from(resultsMap().entries())}>
                  {([result, words]) => (
                    <li class="flex items-center gap-1">
                      <div
                        class="size-4 rounded-sm"
                        style={`background-color: ${RESULT_COLORS[result]};`}
                      ></div>
                      <span>
                        {words.length}x {TEST_RESULT_LABELS[result]}
                      </span>
                    </li>
                  )}
                </For>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card class="order-last md:order-none">
          <CardContent>
            <ResultGuessesBreakdown
              results={props.results}
              selectedWords={selectedWords()}
              words={props.words}
              onSelectionChange={onWordSelectionChange}
            />
          </CardContent>
        </Card>

        <Show when={props.previousWordResults}>
          {previousResults => (
            <Show when={previousResults().length > 0}>
              <Card>
                <CardContent class="flex justify-center">
                  <ResultsComparisonScore
                    testResult={props.results}
                    previousWordResults={previousResults()}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <ResultsComparisonBreakdown
                    testResult={props.results}
                    previousWordResults={previousResults()}
                    selectedWords={selectedWords()}
                    words={props.words}
                    onSelectionChange={onWordSelectionChange}
                  />
                </CardContent>
              </Card>
            </Show>
          )}
        </Show>

        <div class="mx-auto flex flex-wrap items-stretch gap-4 lg:flex-col lg:flex-nowrap">
          <Button type="button" variant="default" onClick={props.onRepeatAll}>
            Test all again
          </Button>
          <Show when={selectedWords().length > 0}>
            <Button
              type="button"
              variant="defaultOutline"
              onClick={onRepeatSelected}
            >
              Test ({selectedWords().length})
            </Button>
            <Button type="button" variant="outline" onClick={onArchiveSelected}>
              Archive ({selectedWords().length})
            </Button>
          </Show>
        </div>
      </div>
    </div>
  );
}
