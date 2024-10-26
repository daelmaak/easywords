import { Show, type Component } from 'solid-js';
import { TestWordResult, type TestResult } from '../model/test-result-model';
import { Card, CardContent } from '~/components/ui/card';
import { RESULT_COLORS } from '../model/colors';

interface Props {
  result: TestResult;
}

const resultGroups = [
  { label: 'Correct', result: TestWordResult.Correct },
  { label: 'Ok', result: TestWordResult.Ok },
  { label: 'Mediocre', result: TestWordResult.Mediocre },
  { label: 'Wrong', result: TestWordResult.Wrong },
  { label: 'To Do', result: undefined },
];

export const VocabularyResultsMini: Component<Props> = props => {
  const getResultCount = (result: TestWordResult | undefined) => {
    return props.result.words.filter(word => word.result === result).length;
  };

  const getColorForStatus = (result: TestWordResult | undefined) => {
    return result == null ? '#cecece' : RESULT_COLORS[result];
  };

  return (
    <Card class="mt-8">
      <CardContent class="p-4">
        <div class="flex justify-between items-center">
          <h2 class="text-md">
            {props.result.done ? 'Last test results' : 'Test in progress'}
          </h2>
          <span class="text-sm">
            {new Date(props.result.updated_at).toLocaleDateString()}
          </span>
        </div>
        <figure class="mt-2">
          <figcaption>
            <dl class="text-sm font-semibold">
              {resultGroups.map(group => (
                <Show when={getResultCount(group.result) > 0}>
                  <div
                    class="flex gap-1 brightness-50"
                    style={{ color: getColorForStatus(group.result) }}
                  >
                    <dd>{getResultCount(group.result)}</dd>
                    <dt>{group.label}</dt>
                  </div>
                </Show>
              ))}
            </dl>
          </figcaption>
          <div class="mt-2 w-full flex gap-[2px] rounded-sm overflow-hidden">
            {resultGroups.map(group => (
              <Show when={getResultCount(group.result) > 0}>
                <div
                  style={{
                    'background-color': getColorForStatus(group.result),
                    'flex-grow': getResultCount(group.result),
                    height: '8px',
                  }}
                ></div>
              </Show>
            ))}
          </div>
        </figure>
      </CardContent>
    </Card>
  );
};
