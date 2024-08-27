import { onMount, type Component } from 'solid-js';
import type { TestResult } from '../model/test-result-model';
import { TestWordResult, TestWordStatus } from '../model/test-result-model';
import { Chart } from 'chart.js/auto';
import { groupBy } from 'lodash-es';

interface Props {
  result: TestResult;
}

const LABELS: Record<TestWordResult, { label: string; color: string }> = {
  [TestWordResult.Correct]: { label: 'Correct', color: '#158a66f2' },
  [TestWordResult.Ok]: { label: 'Ok', color: 'teal' },
  [TestWordResult.Mediocre]: { label: 'Mediocre', color: 'orange' },
  [TestWordResult.Wrong]: { label: 'Wrong', color: '#c64072' },
};

export const TestResultsVisualisation: Component<Props> = props => {
  let canvas!: HTMLCanvasElement;

  onMount(() => {
    const resultsDict = groupBy(props.result.words, v => v.result);
    const resultsMap = new Map(
      Object.entries(resultsDict)
        .filter(([k]) => k != null)
        .sort(([k1], [k2]) => +k1 - +k2)
        .map(([k, v]) => [+k as TestWordResult, v])
    );

    const labels = Array.from(resultsMap.keys()).map(k => LABELS[k]);
    const data = Array.from(resultsMap.values()).map(v => v.length);

    const skipped = props.result.words.filter(
      w => w.status === TestWordStatus.Skipped
    );

    if (skipped.length > 0) {
      labels.push({ label: 'Skipped', color: '#879292' });
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
        labels: labels.map(l => l.label),
        datasets: [
          {
            label: '# of words',
            data,
            backgroundColor: labels.map(l => l.color),
            borderWidth: 1,
          },
        ],
      },
    });
  });

  return <canvas ref={canvas}></canvas>;
};

export default TestResultsVisualisation;
