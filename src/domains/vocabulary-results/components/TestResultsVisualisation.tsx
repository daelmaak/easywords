import { onMount, type Component } from 'solid-js';
import type { TestResult } from '../model/test-result-model';
import { TestWordResult, TestWordStatus } from '../model/test-result-model';
import { Chart } from 'chart.js/auto';

interface Props {
  result: TestResult;
}

export const TestResultsVisualisation: Component<Props> = props => {
  let canvas!: HTMLCanvasElement;

  const correctAnswers = () =>
    props.result.words.filter(w => w.result === TestWordResult.Correct).length;
  const incorrectAnswers = () =>
    props.result.words.filter(w => w.invalidAttempts > 0).length;
  const skippedAnswers = () =>
    props.result.words.filter(w => w.status === TestWordStatus.Skipped).length;

  onMount(() => {
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
        labels: [
          `${correctAnswers()} Correct`,
          `${incorrectAnswers()} Incorrect`,
          `${skippedAnswers()} Skipped`,
        ],
        datasets: [
          {
            label: '# of words',
            data: [correctAnswers(), incorrectAnswers(), skippedAnswers()],
            backgroundColor: ['#158a66f2', '#c64072', '#879292'],
            borderWidth: 1,
          },
        ],
      },
    });
  });

  return <canvas ref={canvas}></canvas>;
};

export default TestResultsVisualisation;
