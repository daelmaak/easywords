import { createMemo, For, type Component } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';
import {
  TestWordStatus,
  type TestResult,
} from '~/domains/vocabulary-results/model/test-result-model';
import { RESULT_COLORS } from '../model/colors';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '~/components/ui/tooltip';
import { Checkbox } from '~/components/ui/checkbox';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import { TEST_RESULT_LABELS } from '../model/labels';
import { categorySelection } from '../util/category-selection';

export interface Props {
  results: TestResult;
  selectedWords: Word[];
  words: Word[];
  onSelectionChange: (selectedWords: Word[]) => void;
}

type EnrichedWord = TestResultWord & {
  word: Word;
};

const ATTEMPT_TOOLTIP: Record<TestWordStatus, string> = {
  [TestWordStatus.NotDone]: 'Not done',
  [TestWordStatus.Correct]: 'Perfect!',
  [TestWordStatus.Good]: 'Good attempt',
  [TestWordStatus.Fair]: 'Fair attempt',
  [TestWordStatus.Wrong]: 'Wrong attempt',
};

export const ResultGuessesBreakdown: Component<Props> = props => {
  const {
    getCategorySelectionStatus,
    isWordSelected,
    onWordSelected,
    onCategorySelected,
  } = categorySelection(props.words, props.onSelectionChange);

  const enrichedWordsDict = createMemo(() => {
    const wordMap = props.results.words
      .map(word => ({
        ...word,
        word: props.words.find(w => w.id === word.word_id)!,
      }))
      // Fix for test progresses which contain deleted words, which in turn caused
      // tests to break.
      // TODO: Should be safe to remove in the near future.
      .filter(w => w.word != null)
      .reduce((acc, curr) => {
        if (!acc.has(curr.result)) {
          acc.set(curr.result, []);
        }
        acc.get(curr.result)!.push(curr);
        return acc;
      }, new Map<TestWordStatus, EnrichedWord[]>());

    return Array.from(wordMap.entries()).toSorted(
      ([resultA], [resultB]) => resultA - resultB
    );
  });

  return (
    <Accordion
      collapsible
      data-testid="results-word-breakdown"
      multiple
      class="mx-auto w-full max-w-[32rem]"
    >
      <For each={enrichedWordsDict()}>
        {([result, words]) => {
          const unwrappedWords = words.map(w => w.word);
          const categorySelectionStatus = createMemo(() =>
            getCategorySelectionStatus(unwrappedWords, props.selectedWords)
          );

          return (
            <AccordionItem value={result.toString()}>
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
                    <span>{TEST_RESULT_LABELS[result]}</span>
                    <span
                      class="text-sm font-bold"
                      style={{ color: RESULT_COLORS[result] }}
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
                        <span>
                          {word.word.original} - {word.word.translation}
                        </span>
                        <span>
                          <For each={word.attempts}>
                            {attempt => (
                              <Tooltip openDelay={100}>
                                <TooltipTrigger
                                  class="ml-1 size-4 rounded-sm"
                                  tabindex="-1"
                                  style={{
                                    'background-color': RESULT_COLORS[attempt],
                                  }}
                                >
                                  <span class="sr-only">
                                    Open attempt tooltip
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {ATTEMPT_TOOLTIP[attempt]}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </For>
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
