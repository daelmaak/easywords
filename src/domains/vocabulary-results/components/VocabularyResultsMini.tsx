import { Match, Show, Switch, type Component } from 'solid-js';
import { TestWordResult, type TestResult } from '../model/test-result-model';
import { Card, CardContent } from '~/components/ui/card';
import { RESULT_COLORS } from '../model/colors';
import { HiOutlineCheckCircle, HiOutlinePauseCircle } from 'solid-icons/hi';

interface Props {
  result: TestResult;
}

const resultGroups = [
  { label: 'Correct', result: TestWordResult.Correct },
  { label: 'Ok', result: TestWordResult.Ok },
  { label: 'Mediocre', result: TestWordResult.Mediocre },
  { label: 'Wrong', result: TestWordResult.Wrong },
  { label: 'To do', result: TestWordResult.NotDone },
];

export const VocabularyResultsMini: Component<Props> = props => {
  const getResultCount = (result: TestWordResult) => {
    return props.result.words.filter(word => word.result === result).length;
  };

  const getColorForStatus = (result: TestWordResult) => {
    return RESULT_COLORS[result];
  };

  return (
    <Card class="mt-8">
      <CardContent class="p-4">
        <div class="flex items-center justify-between">
          <span class="inline-flex items-center gap-1">
            <span class="text-xl">
              <Switch>
                <Match when={props.result.done}>
                  <HiOutlineCheckCircle class="text-green-600" />
                </Match>
                <Match when={!props.result.done}>
                  <HiOutlinePauseCircle class="text-yellow-600" />
                </Match>
              </Switch>
            </span>
            <h2 class="text-sm">
              {props.result.done ? 'Last test results' : 'Test in progress'}
            </h2>
          </span>
          <span class="text-xs">
            {new Date(props.result.updated_at).toLocaleDateString()}
          </span>
        </div>
        <figure class="mt-3">
          <figcaption>
            <dl class="flex gap-2 text-sm">
              {resultGroups.map(group => (
                <Show when={getResultCount(group.result) > 0}>
                  <div class="mt-1 flex items-center gap-1">
                    <dd class="text-neutral-600">
                      {getResultCount(group.result)}x
                    </dd>
                    <dt
                      class="rounded-sm px-1.5 py-0.5 text-xs text-white"
                      style={{
                        'background-color': getColorForStatus(group.result),
                      }}
                    >
                      {group.label}
                    </dt>
                  </div>
                </Show>
              ))}
            </dl>
          </figcaption>
          <div class="mt-3 flex w-full gap-[2px] overflow-hidden rounded-sm">
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
