import { Match, Show, Switch, type Component } from 'solid-js';
import type { TestWordStatus } from '../model/test-result-model';
import { type TestResult } from '../model/test-result-model';
import { Card, CardContent } from '~/components/ui/card';
import { RESULT_COLORS } from '../model/colors';
import { HiOutlineCheckCircle, HiOutlinePauseCircle } from 'solid-icons/hi';
import { TEST_RESULT_LABELS } from '../model/labels';
import {
  formatDate,
  THREE_LETTER_MONTH_WITH_YEAR_OPTIONS,
} from '~/util/format-date';

interface Props {
  result: TestResult;
}

const resultGroups = Object.entries(TEST_RESULT_LABELS).map(([key, label]) => ({
  label,
  result: parseInt(key) as TestWordStatus,
}));

export const VocabularyResultsMini: Component<Props> = props => {
  const getResultCount = (result: TestWordStatus) => {
    return props.result.words.filter(word => word.result === result).length;
  };

  const getColorForStatus = (result: TestWordStatus) => {
    return RESULT_COLORS[result];
  };

  return (
    <Card>
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
            {props.result.updated_at
              ? formatDate(
                  new Date(props.result.updated_at),
                  THREE_LETTER_MONTH_WITH_YEAR_OPTIONS
                )
              : 'Just now'}
          </span>
        </div>
        <figure class="mt-3">
          <figcaption>
            <dl class="flex flex-wrap gap-x-2 text-sm">
              {resultGroups.map(group => (
                <Show when={getResultCount(group.result) > 0}>
                  <div class="mt-1 flex items-center gap-1">
                    <dd class="text-neutral-600">
                      {getResultCount(group.result)}x
                    </dd>
                    <dt
                      class="rounded-sm px-1.5 py-0.5 text-xs tracking-wide text-white shadow-black/60 text-shadow-sm"
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
