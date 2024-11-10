import { createEffect, createMemo, type Component } from 'solid-js';
import Chart from 'chart.js/auto';
import type { ChartData, ChartOptions } from 'chart.js';
import type { Word } from '../model/vocabulary-model';
import type {
  TestResultWord,
  TestWordStatus,
} from '~/domains/vocabulary-results/model/test-result-model';

interface WordDetailResultsProps {
  word: Word;
  results?: TestResultWord[];
}

const TEST_RESULT_LABELS: Record<TestWordStatus, string> = {
  0: 'Not done',
  1: 'Perfect',
  2: 'Good',
  3: 'Fair',
  4: 'Wrong',
} as const;

const getColorForResult = (result: TestWordStatus) => {
  switch (result) {
    case 1:
      return 'rgb(34, 197, 94)';
    case 2:
      return 'rgb(172, 186, 92)';
    case 3:
      return 'rgb(234, 179, 8)';
    case 4:
      return 'rgb(239, 68, 68)';
  }
};

export const WordDetailResults: Component<WordDetailResultsProps> = props => {
  let canvas!: HTMLCanvasElement;
  let chart: Chart<'line'> | undefined;

  const results = createMemo(() => props.results?.filter(r => r.done) ?? []);

  createEffect(() => {
    if (!props.results) return;

    if (chart) {
      chart.destroy();
    }

    const chartData: ChartData<'line'> = {
      labels: results().map(r => new Date(r.created_at).toLocaleDateString()),
      datasets: [
        {
          data: results().map(r => r.result),
          segment: {
            borderColor: ctx => getColorForResult(ctx.p1.parsed.y),
            backgroundColor: ctx => {
              const color = getColorForResult(ctx.p1.parsed.y);
              // Convert the color to rgba with opacity
              return color!.replace('rgb', 'rgba').replace(')', ', 0.1)');
            },
          },
          borderColor: results().map(r => getColorForResult(r.result)),
          backgroundColor: results().map(r => getColorForResult(r.result)),
          fill: 'start',
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3,
        },
      ],
    };

    const chartOptions: ChartOptions<'line'> = {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: context => {
              const value = context.parsed.y as TestWordStatus;
              return ` You tested ${TEST_RESULT_LABELS[value]} here.`;
            },
          },
        },
      },
      scales: {
        y: {
          reverse: true,
          border: {
            display: true,
            dash: [4, 4],
          },
          ticks: {
            stepSize: 1,
            callback: (value: string | number) => {
              return value ? TEST_RESULT_LABELS[value as TestWordStatus] : ' ';
            },
          },
        },
        x: {
          border: {
            display: false,
          },
          grid: {
            display: false,
          },
          ticks: {
            align: 'center',
          },
          title: {
            display: false,
          },
        },
      },
    };

    chart = new Chart(canvas, {
      type: 'line',
      data: chartData,
      options: chartOptions,
    });
  });

  return <canvas class="w-full" ref={canvas} />;
};
