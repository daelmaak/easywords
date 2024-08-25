import { Show, type Component } from 'solid-js';
import {
  TestWordResult,
  TestWordStatus,
  type TestResult,
} from '../model/test-result-model';
import { Card, CardContent } from '~/components/ui/card';

interface Props {
  result: TestResult;
}

export const VocabularyResultsMini: Component<Props> = props => {
  const correctAnswers = () =>
    props.result.words.filter(w => w.result === TestWordResult.Correct).length;
  const incorrectAnswers = () =>
    props.result.words.filter(w => w.invalidAttempts > 0).length;
  const skippedAnswers = () =>
    props.result.words.filter(w => w.status === TestWordStatus.Skipped).length;

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
                <dd class="">{correctAnswers().toFixed(0)}</dd>
                <dt>correct</dt>
              </div>
              <div class="flex gap-1 text-red-900">
                <dd class="">{incorrectAnswers().toFixed(0)}</dd>
                <dt>incorrect</dt>
              </div>
              <Show when={+skippedAnswers() > 0}>
                <div class="flex gap-1 text-gray-700">
                  <dd class="">{skippedAnswers().toFixed(0)}</dd>
                  <dt>skipped</dt>
                </div>
              </Show>
            </dl>
          </figcaption>
          <div class="mt-2 w-full flex gap-[2px] rounded-sm overflow-hidden">
            <Show when={correctAnswers() > 0}>
              <div
                class="h-2 bg-green-900"
                style={{ 'flex-grow': correctAnswers() }}
              ></div>
            </Show>
            <Show when={incorrectAnswers() > 0}>
              <div
                class="h-2 bg-red-700"
                style={{ 'flex-grow': incorrectAnswers() }}
              ></div>
            </Show>
            <Show when={skippedAnswers() > 0}>
              <div
                class="h-2 bg-gray-400"
                style={{ 'flex-grow': skippedAnswers() }}
              ></div>
            </Show>
          </div>
        </figure>
      </CardContent>
    </Card>
  );
};
