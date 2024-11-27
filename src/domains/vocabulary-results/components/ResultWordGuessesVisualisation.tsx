import { createMemo, createSignal, For, type Component } from 'solid-js';
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
import { wordsSelector } from '~/util/selection';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';
import differenceBy from 'lodash-es/differenceBy';
import unionBy from 'lodash-es/unionBy';
import { TEST_RESULT_LABELS } from '../model/labels';

export interface Props {
  results: TestResult;
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

export const ResultWordGuessesSummary: Component<Props> = props => {
  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  const selectWords = wordsSelector();

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

  const enrichedWords = createMemo(() =>
    enrichedWordsDict().flatMap(([_, words]) => words)
  );

  const wordSelected = (word: Word) =>
    selectedWords().find(sw => word.id === sw.id) != null;

  function onWordSelected(
    word: Word,
    selected: boolean,
    meta?: { shiftSelection: boolean }
  ) {
    const newSelectedWords = selectWords(
      word,
      selected,
      enrichedWords().map(w => w.word),
      selectedWords(),
      meta
    );
    setSelectedWords(newSelectedWords);
    props.onSelectionChange(newSelectedWords);
  }

  function onCategorySelected(
    enrichedWords: EnrichedWord[],
    selected: boolean
  ) {
    const words = enrichedWords.map(w => w.word);

    if (selected) {
      setSelectedWords(ws => unionBy(ws, words, 'id'));
    } else {
      setSelectedWords(ws => differenceBy(ws, words, 'id'));
    }
    props.onSelectionChange(selectedWords());
  }

  return (
    <>
      <Accordion
        collapsible
        data-testid="results-word-breakdown"
        multiple
        class="mx-auto w-full max-w-[32rem]"
      >
        <For each={enrichedWordsDict()}>
          {([result, words]) => (
            <AccordionItem value={result.toString()}>
              <AccordionHeader class="flex">
                <Checkbox
                  class="mr-2"
                  onChange={checked => onCategorySelected(words, checked)}
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
                      <li class="flex justify-between rounded-md p-1.5 text-base even:bg-purple-50">
                        <Checkbox
                          checked={wordSelected(word.word)}
                          onChange={checked =>
                            onWordSelected(word.word, checked)
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
          )}
        </For>
      </Accordion>
    </>
  );
};
