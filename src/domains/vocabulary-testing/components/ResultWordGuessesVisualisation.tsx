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
  const maxInvalidAttempts = () =>
    Math.max(...props.results.words.map(word => word.invalidAttempts));

  const enrichedWords = () =>
    props.results.words
      .map(word => ({
        ...word,
        word: props.words.find(w => w.id === word.id)!,
      }))
      .sort((a, b) => b.invalidAttempts - a.invalidAttempts);

  return (
    <table class="table-auto border-separate sm:border-spacing-x-8 border-spacing-y-1">
      <thead>
        <tr>
          <th></th>
          <th class="font-normal">Finished</th>
          <Show when={maxInvalidAttempts() > 0}>
            <th class="font-normal">Incorrect attempts</th>
          </Show>
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
              <Show when={maxInvalidAttempts() > 0}>
                <td class="flex sm:w-60">
                  <Show when={resultWord.invalidAttempts > 0}>
                    <div
                      class="px-2 h-6 flex items-center bg-[#cd497a] rounded-e-lg text-white text-sm"
                      style={{
                        'flex-grow': `${resultWord.invalidAttempts}`,
                      }}
                    >
                      {resultWord.invalidAttempts}
                    </div>
                  </Show>
                  <div
                    style={{
                      'flex-grow': `${
                        maxInvalidAttempts() - resultWord.invalidAttempts
                      }`,
                    }}
                  ></div>
                </td>
              </Show>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
};
