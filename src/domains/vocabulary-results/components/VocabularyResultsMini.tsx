import { type Component } from 'solid-js';
import type { TestResult } from '../model/test-result-model';
import { Card, CardContent } from '~/components/ui/card';
import { TestResultsVisualisation } from './TestResultsVisualisation';

interface Props {
  result: TestResult;
}

export const VocabularyResultsMini: Component<Props> = props => {
  return (
    <Card class="mt-8">
      <CardContent class="p-4">
        <div class="flex justify-between items-center">
          <h2 class="text-md">Last test results</h2>
          <span class="text-sm">
            {props.result.updatedAt.toLocaleDateString()}
          </span>
        </div>
        <TestResultsVisualisation result={props.result} />
      </CardContent>
    </Card>
  );
};
