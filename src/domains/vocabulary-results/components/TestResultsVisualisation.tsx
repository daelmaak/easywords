import { onMount, type Component } from 'solid-js';
import type { TestResult } from '../model/test-result-model';
import { TestWordStatus } from '../model/test-result-model';
import { Chart } from 'chart.js/auto';
import { groupBy } from 'lodash-es';
import { RESULT_COLORS } from '../model/colors';
import { TEST_RESULT_LABELS } from '../model/labels';

interface Props {
  result: TestResult;
}

export const TestResultsVisualisation: Component<Props> = props => {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const resultsDict = groupBy(props.result.words, v => v.result);
    const resultsMap = new Map(
      Object.entries(resultsDict)
        .filter(([k]) => k != null)
        .sort(([k1], [k2]) => +k1 - +k2)
        .map(([k, v]) => [+k as TestWordStatus, v])
    );

    const resultCategories = Array.from(resultsMap.keys());
    const labels = resultCategories.map(k => TEST_RESULT_LABELS[k]);
    const colors = resultCategories.map(k => RESULT_COLORS[k]);
    const data = Array.from(resultsMap.values()).map(v => v.length);

    const skipped = props.result.words.filter(
      w => w.result == TestWordStatus.NotDone
    );

    if (skipped.length > 0) {
      labels.push('Skipped');
      colors.push('#879292');
      data.push(skipped.length);
    }

    new Chart(canvas, {
      type: 'doughnut',
      options: {
        plugins: {
          legend: {
            display: false,
          },
        },
      },
      data: {
        labels,
        datasets: [
          {
            label: ' words',
            data,
            backgroundColor: colors,
            borderWidth: 2,
          },
        ],
      },
    });
  });

  return <canvas ref={canvas}></canvas>;
};

export default TestResultsVisualisation;
