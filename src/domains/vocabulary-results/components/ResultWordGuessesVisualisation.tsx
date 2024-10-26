import { HiSolidCheckCircle } from 'solid-icons/hi';
import { createMemo, createSignal, For, Show, type Component } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import {
  TestWordResult,
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

export interface Props {
  results: TestResult;
  words: Word[];
  onSelectionChange: (selectedWords: Word[]) => void;
}

const ATTEMPT_TOOLTIP: Record<TestWordResult, string> = {
  [TestWordResult.NotDone]: 'Not done',
  [TestWordResult.Correct]: 'Correct attempt',
  [TestWordResult.Ok]: 'Ok attempt',
  [TestWordResult.Mediocre]: 'Mediocre attempt',
  [TestWordResult.Wrong]: 'Wrong attempt',
};

export const ResultWordGuessesVisualisation: Component<Props> = props => {
  const [selectedWords, setSelectedWords] = createSignal<Word[]>([]);
  const selectWords = wordsSelector();

  const enrichedWords = createMemo(() =>
    props.results.words
      .map(word => ({
        ...word,
        word: props.words.find(w => w.id === word.word_id)!,
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
        return (b.attempts?.length ?? 0) - (a.attempts?.length ?? 0);
      })
  );

  const wordSelected = (word: Word) =>
    selectedWords().find(sw => word.id === sw.id) != null;

  function onCheckboxClick(e: MouseEvent, checked: boolean, word: Word) {
    onWordSelected(word, checked, {
      shiftSelection: e.shiftKey,
    });
  }

  function setSelectedWordsAndNotify(newSelectedWords: Word[]) {
    setSelectedWords(newSelectedWords);
    props.onSelectionChange(newSelectedWords);
  }

  function onSelectAll(selected: boolean) {
    setSelectedWordsAndNotify(selected ? props.words : []);
  }

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

    setSelectedWordsAndNotify(newSelectedWords);
  }

  return (
    <table class="table-auto border-separate border-spacing-y-1 sm:border-spacing-x-8">
      <thead>
        <tr class="text-left">
          <th class="font-normal">
            <Show when={selectedWords().length > 0}>
              <Checkbox
                checked={selectedWords().length === props.words.length}
                indeterminate={
                  selectedWords().length > 0 &&
                  selectedWords().length < props.words.length
                }
                onChange={() => onSelectAll(selectedWords().length === 0)}
              />
            </Show>
          </th>
          {/* Added header for checkbox */}
          <th class="font-normal">Words</th>
          <th class="font-normal">Finished</th>
          <th class="font-normal">Attempts</th>
        </tr>
      </thead>
      <tbody>
        <For each={enrichedWords()}>
          {resultWord => (
            <tr>
              <td>
                <Checkbox
                  class="mr-2"
                  checked={wordSelected(resultWord.word)}
                  onClick={(e: MouseEvent) =>
                    onCheckboxClick(
                      e,
                      !wordSelected(resultWord.word),
                      resultWord.word
                    )
                  }
                  // Prevents text selection when shift clicking
                  onMouseDown={(e: MouseEvent) => e.preventDefault()}
                />
              </td>
              <td class="mr-2">
                {resultWord.word.original} - {resultWord.word.translation}
              </td>
              <td class="text-center">
                <Show when={resultWord.result !== TestWordResult.NotDone}>
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
