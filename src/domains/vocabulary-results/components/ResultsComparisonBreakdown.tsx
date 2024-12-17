import { For, type Component, createMemo } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import type {
  PreviousWordResult,
  TestResult,
} from '~/domains/vocabulary-results/model/test-result-model';
import { TestWordStatus } from '~/domains/vocabulary-results/model/test-result-model';
import { RESULT_COLORS } from '../model/colors';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '~/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { groupBy } from 'lodash-es';
import { TEST_RESULT_LABELS } from '../model/labels';
import { Checkbox } from '~/components/ui/checkbox';
import { categorySelection } from '../util/category-selection';

interface Props {
  testResult: TestResult;
  previousWordResults: PreviousWordResult[];
  selectedWords: Word[];
  words: Word[];
  onSelectionChange: (selectedWords: Word[]) => void;
  onWordClick: (word: Word) => void;
}

enum ComparisonStatus {
  Improved = 1,
  Unchanged = 0,
  Worsened = -1,
}

interface WordWithComparison {
  word: Word;
  currentResult: TestWordStatus;
  previousResult: TestWordStatus;
}

const STATUS_LABELS: Record<ComparisonStatus, string> = {
  [ComparisonStatus.Improved]: 'Improved',
  [ComparisonStatus.Unchanged]: 'Unchanged',
  [ComparisonStatus.Worsened]: 'Worsened',
};

const STATUS_COLORS: Record<ComparisonStatus, string> = {
  [ComparisonStatus.Improved]: '#22c55e', // text-green-500
  [ComparisonStatus.Worsened]: '#ef4444', // text-red-500
  [ComparisonStatus.Unchanged]: '#6b7280', // text-gray-500
};

export const ResultsComparisonBreakdown: Component<Props> = props => {
  const {
    getCategorySelectionStatus,
    isWordSelected,
    onWordSelected,
    onCategorySelected,
  } = categorySelection(props.words, props.onSelectionChange);

  const previousResultsMap = createMemo(
    () => new Map(props.previousWordResults.map(prev => [prev.word_id, prev]))
  );

  const comparedWords = createMemo(() => {
    const result: WordWithComparison[] = [];
    const wordMap = new Map(props.words.map(word => [word.id, word]));

    props.testResult.words.forEach(currentWord => {
      if (currentWord.result === TestWordStatus.NotDone) return;

      const previousResult = previousResultsMap().get(currentWord.word_id);
      if (!previousResult) return;

      const word = wordMap.get(currentWord.word_id);
      if (!word) return;

      result.push({
        word,
        currentResult: currentWord.result,
        previousResult: previousResult.result,
      });
    });

    return result;
  });

  const groupedWords = createMemo(() => {
    const words = comparedWords();
    return groupBy(
      words,
      (word): ComparisonStatus =>
        Math.sign(word.previousResult - word.currentResult)
    );
  });

  return (
    <Accordion
      collapsible
      data-testid="results-comparison-breakdown"
      multiple
      class="mx-auto w-full max-w-[32rem]"
    >
      <For
        each={Object.entries(groupedWords()).toSorted(([a], [b]) => +b - +a)}
      >
        {([status, words]) => {
          const unwrappedWords = words.map(w => w.word);
          const categorySelectionStatus = createMemo(() =>
            getCategorySelectionStatus(unwrappedWords, props.selectedWords)
          );

          return (
            <AccordionItem value={status}>
              <AccordionHeader class="flex">
                <Checkbox
                  class="mr-2"
                  checked={categorySelectionStatus() === 'full'}
                  indeterminate={categorySelectionStatus() === 'partial'}
                  onChange={checked =>
                    onCategorySelected(
                      unwrappedWords,
                      props.selectedWords,
                      checked
                    )
                  }
                />
                <AccordionTrigger class="outline-none">
                  <span class="inline-flex items-center gap-2">
                    <span>{STATUS_LABELS[+status as ComparisonStatus]}</span>
                    <span
                      class="text-sm font-bold"
                      style={{
                        color: STATUS_COLORS[+status as ComparisonStatus],
                      }}
                    >
                      {words.length} x
                    </span>
                  </span>
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <ul>
                  <For each={words}>
                    {word => (
                      <li class="flex items-center justify-between rounded-md p-1.5 text-base even:bg-purple-50">
                        <Checkbox
                          checked={isWordSelected(
                            word.word,
                            props.selectedWords
                          )}
                          onChange={checked =>
                            onWordSelected(
                              word.word,
                              props.selectedWords,
                              checked
                            )
                          }
                        />
                        <span onClick={() => props.onWordClick(word.word)}>
                          {word.word.original} - {word.word.translation}
                        </span>
                        <span class="flex items-center gap-1">
                          <Tooltip openDelay={100}>
                            <TooltipTrigger
                              class="size-4 rounded-sm"
                              tabindex="-1"
                              style={{
                                'background-color':
                                  RESULT_COLORS[word.previousResult],
                              }}
                            >
                              <span class="sr-only">Previous result</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Previous:{' '}
                              <span>
                                {TEST_RESULT_LABELS[word.previousResult]}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                          <span class="text-gray-400">→</span>
                          <Tooltip openDelay={100}>
                            <TooltipTrigger
                              class="size-4 rounded-sm"
                              tabindex="-1"
                              style={{
                                'background-color':
                                  RESULT_COLORS[word.currentResult],
                              }}
                            >
                              <span class="sr-only">Current result</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Current:{' '}
                              <span>
                                {TEST_RESULT_LABELS[word.currentResult]}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </span>
                      </li>
                    )}
                  </For>
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        }}
      </For>
    </Accordion>
  );
};
