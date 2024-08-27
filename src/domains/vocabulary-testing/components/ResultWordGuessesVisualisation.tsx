import { HiSolidCheckCircle } from 'solid-icons/hi';
import { For, Show, type Component } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import {
  TestWordStatus,
  type TestResult,
} from '~/domains/vocabulary-results/model/test-result-model';

export interface Props {
  results: TestResult;
  words: Word[];
}

export const ResultWordGuessesVisualisation: Component<Props> = props => {
  const enrichedWords = () =>
    props.results.words
      .map(word => ({
        ...word,
        word: props.words.find(w => w.id === word.id)!,
      }))
      .sort((a, b) => b.attempts.length - a.attempts.length);

  return (
    <table class="table-auto border-separate sm:border-spacing-x-8 border-spacing-y-1">
      <thead>
        <tr>
          <th></th>
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
              <td class="flex sm:w-60">
                <For each={resultWord.attempts}>
                  {() => <span class="size-2 bg-red-700"></span>}
                </For>
              </td>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
};
