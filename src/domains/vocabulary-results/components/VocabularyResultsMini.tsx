import { createMemo, Show, type Component } from 'solid-js';
import type { TestResult } from '../model/test-result-model';
import { Card, CardContent } from '~/components/ui/card';

interface Props {
  result: TestResult;
}

export const VocabularyResultsMini: Component<Props> = props => {
  const correctAnswers = () =>
    props.result.words.filter(w => w.done && w.invalidAttempts === 0);
  const incorrectAnswers = () =>
    props.result.words.filter(w => w.invalidAttempts > 0);

  const percentages = createMemo(() => {
    const correct = correctAnswers().length;
    const incorrect = incorrectAnswers().length;
    const skipped = props.result.words.length - correct - incorrect;

    return {
      correct: (correct / props.result.words.length) * 100,
      incorrect: (incorrect / props.result.words.length) * 100,
      skipped: (skipped / props.result.words.length) * 100,
    };
  });

  return (
    <Card class="mt-8">
      <CardContent class="p-4">
        <div class="flex justify-between items-center">
          <h2 class="text-md">Last test results</h2>
          <span class="text-sm">
            {props.result.updatedAt.toLocaleDateString()}
          </span>
        </div>

        <figure class="mt-2">
          <figcaption>
            <dl class="text-sm font-semibold">
              <div class="flex gap-1 text-green-900">
                <dd class="">{percentages().correct.toFixed(0)}%</dd>
                <dt>correct</dt>
              </div>
              <div class="flex gap-1 text-red-900">
                <dd class="">{percentages().incorrect.toFixed(0)}%</dd>
                <dt>incorrect</dt>
              </div>
              <Show when={+percentages().skipped > 0}>
                <div class="flex gap-1 text-gray-700">
                  <dd class="">{percentages().skipped.toFixed(0)}%</dd>
                  <dt>skipped</dt>
                </div>
              </Show>
            </dl>
          </figcaption>
          <div class="mt-2 w-full flex gap-[2px] rounded-sm overflow-hidden">
            <Show when={percentages().correct > 0}>
              <div
                class="h-2 bg-green-900"
                style={{ 'flex-grow': percentages().correct }}
              ></div>
            </Show>
            <Show when={percentages().incorrect > 0}>
              <div
                class="h-2 bg-red-700"
                style={{ 'flex-grow': percentages().incorrect }}
              ></div>
            </Show>
            <Show when={percentages().skipped > 0}>
              <div
                class="h-2 bg-gray-400"
                style={{ 'flex-grow': percentages().skipped }}
              ></div>
            </Show>
          </div>
        </figure>
      </CardContent>
    </Card>
  );
};
