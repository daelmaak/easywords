import { HiSolidCheckCircle } from 'solid-icons/hi';
import { For, Show, type Component } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import {
  TestWordResult,
  TestWordStatus,
  type TestResult,
} from '~/domains/vocabulary-results/model/test-result-model';
import { RESULT_COLORS } from '../model/colors';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '~/components/ui/tooltip';

export interface Props {
  results: TestResult;
  words: Word[];
}

const ATTEMPT_TOOLTIP: Record<TestWordResult, string> = {
  [TestWordResult.Correct]: 'Correct attempt',
  [TestWordResult.Ok]: 'Ok attempt',
  [TestWordResult.Mediocre]: 'Mediocre attempt',
  [TestWordResult.Wrong]: 'Wrong attempt',
};

export const ResultWordGuessesVisualisation: Component<Props> = props => {
  const enrichedWords = () =>
    props.results.words
      .map(word => ({
        ...word,
        word: props.words.find(w => w.id === word.id)!,
      }))
      // Fix for test progresses which contain deleted words, which in turn caused
      // tests to break.
      // TODO: Should be safe to remove in the near future.
      .filter(w => w.word != null)
      .sort((a, b) => {
        // First, sort by result (worse results first)
        const resultDiff = (b.result ?? 0) - (a.result ?? 0);
        if (resultDiff !== 0) return resultDiff;

        // If results are equal, sort by number of attempts (descending)
        return b.attempts.length - a.attempts.length;
      });

  return (
    <table class="table-auto border-separate sm:border-spacing-x-8 border-spacing-y-1">
      <thead>
        <tr class="text-left">
          <th class="font-normal">Words</th>
          <th class="font-normal">Finished</th>
          <th class="font-normal">Attempts</th>
        </tr>
      </thead>
      <tbody>
        <For each={enrichedWords()}>
          {resultWord => (
            <tr>
              <td class="mr-2">{resultWord.word.original}</td>
              <td class="text-center">
                <Show when={resultWord.status === TestWordStatus.Done}>
                  <HiSolidCheckCircle
                    class="mx-auto text-[#00825b]"
                    size={28}
                  />
                </Show>
              </td>
              <td>
                <For each={resultWord.attempts}>
                  {attempt => (
                    <Tooltip openDelay={100}>
                      <TooltipTrigger
                        class="ml-1 size-4 rounded-sm"
                        tabindex="-1"
                        style={{ 'background-color': RESULT_COLORS[attempt] }}
                      >
                        <span class="sr-only">Open attempt tooltip</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {ATTEMPT_TOOLTIP[attempt]}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </For>
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
};
