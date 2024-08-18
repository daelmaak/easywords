import { HiSolidCheckCircle } from 'solid-icons/hi';
import { For, Show, type Component } from 'solid-js';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';

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
          {result => (
            <tr>
              <td class="mr-2">{result.word.original}</td>
              <td class="text-center">
                <Show when={result.done}>
                  <HiSolidCheckCircle
                    class="mx-auto text-[#00825b]"
                    size={28}
                  />
                </Show>
              </td>
              <Show when={maxInvalidAttempts() > 0}>
                <td class="flex sm:w-60">
                  <Show when={result.invalidAttempts > 0}>
                    <div
                      class="px-2 h-6 flex items-center bg-[#cd497a] rounded-e-lg text-white text-sm"
                      style={{
                        'flex-grow': `${result.invalidAttempts}`,
                      }}
                    >
                      {result.invalidAttempts}
                    </div>
                  </Show>
                  <div
                    style={{
                      'flex-grow': `${
                        maxInvalidAttempts() - result.invalidAttempts
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
