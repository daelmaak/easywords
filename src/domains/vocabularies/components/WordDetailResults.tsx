import { createEffect, createMemo, type Component } from 'solid-js';
import Chart from 'chart.js/auto';
import type { ChartData, ChartOptions } from 'chart.js';
import type { Word } from '../model/vocabulary-model';
import type {
  TestResultWord,
  TestWordStatus,
} from '~/domains/vocabulary-results/model/test-result-model';
import { TEST_RESULT_LABELS } from '../../vocabulary-results/model/labels';
import { RESULT_COLORS } from '~/domains/vocabulary-results/model/colors';

interface WordDetailResultsProps {
  word: Word;
  results?: TestResultWord[];
}

const getColorForResult = (result: TestWordStatus) => {
  return RESULT_COLORS[result];
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
      maintainAspectRatio: true,
      aspectRatio: 3,
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
