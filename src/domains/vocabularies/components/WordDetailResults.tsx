import { createEffect, createMemo, type Component } from 'solid-js';
import Chart from 'chart.js/auto';
import type { ChartData, ChartOptions } from 'chart.js';
import type { Word } from '../model/vocabulary-model';
import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';

interface WordDetailResultsProps {
  word: Word;
  results?: TestResultWord[];
}

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
          borderColor: '#888888',
          backgroundColor: results().map(r => {
            switch (r.result) {
              case 1:
                return 'rgb(34, 197, 94)';
              case 2:
                return '#acba5c';
              case 3:
                return 'rgb(234, 179, 8)';
              case 4:
                return 'rgb(239, 68, 68)';
            }
          }),
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 1,
        },
      ],
    };

    const chartOptions: ChartOptions<'line'> = {
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          reverse: true,
          ticks: {
            stepSize: 1,
            callback: (value: string | number) => {
              return value
                ? {
                    1: 'Correct',
                    2: 'Good',
                    3: 'Fair',
                    4: 'Wrong',
                  }[value]
                : ' ';
            },
          },
        },
        x: {
          ticks: {
            align: 'center',
          },
          title: {
            display: true,
            text: 'Test Date',
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
