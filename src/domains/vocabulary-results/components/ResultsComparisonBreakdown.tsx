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
import { wordsSelector } from '~/util/selection';
import differenceBy from 'lodash-es/differenceBy';
import unionBy from 'lodash-es/unionBy';

interface Props {
  testResult: TestResult;
  previousWordResults: PreviousWordResult[];
  selectedWords: Word[];
  words: Word[];
  onSelectionChange: (selectedWords: Word[]) => void;
}

type ComparisonStatus = 'improved' | 'worsened' | 'unchanged';

interface WordWithComparison {
  word: Word;
  currentResult: TestWordStatus;
  previousResult: TestWordStatus;
}

const STATUS_LABELS: Record<ComparisonStatus, string> = {
  improved: 'Improved',
  worsened: 'Worsened',
  unchanged: 'Unchanged',
};

const STATUS_COLORS: Record<ComparisonStatus, string> = {
  improved: '#22c55e', // text-green-500
  worsened: '#ef4444', // text-red-500
  unchanged: '#6b7280', // text-gray-500
};

export const ResultsComparisonBreakdown: Component<Props> = props => {
  const selectWords = wordsSelector();

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
    return groupBy(words, (word): ComparisonStatus => {
      if (word.currentResult < word.previousResult) return 'improved';
      if (word.currentResult > word.previousResult) return 'worsened';
      return 'unchanged';
    });
  });

  const wordSelected = (word: Word) =>
    props.selectedWords.find(sw => word.id === sw.id) != null;

  function onWordSelected(word: Word, selected: boolean) {
    const newSelectedWords = selectWords(
      word,
      selected,
      comparedWords().map(w => w.word),
      props.selectedWords
    );
    props.onSelectionChange(newSelectedWords);
  }

  function onCategorySelected(words: WordWithComparison[], selected: boolean) {
    const categoryWords = words.map(w => w.word);

    if (selected) {
      props.onSelectionChange(unionBy(props.selectedWords, categoryWords, 'id'));
    } else {
      props.onSelectionChange(differenceBy(props.selectedWords, categoryWords, 'id'));
    }
  }

  return (
    <Accordion
      collapsible
      data-testid="results-comparison-breakdown"
      multiple
      class="mx-auto w-full max-w-[32rem]"
    >
      <For each={Object.entries(groupedWords())}>
        {([status, words]) => (
          <AccordionItem value={status}>
            <AccordionHeader class="flex">
              <Checkbox
                class="mr-2"
                onChange={checked => onCategorySelected(words, checked)}
              />
              <AccordionTrigger class="outline-none">
                <span class="inline-flex items-center gap-2">
                  <span>{STATUS_LABELS[status as ComparisonStatus]}</span>
                  <span
                    class="text-sm font-bold"
                    style={{ color: STATUS_COLORS[status as ComparisonStatus] }}
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
                        checked={wordSelected(word.word)}
                        onChange={checked => onWordSelected(word.word, checked)}
                      />
                      <span>
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
        )}
      </For>
    </Accordion>
  );
};
