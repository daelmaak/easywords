import { cx } from 'class-variance-authority';
import { createMemo, type Component } from 'solid-js';
import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';

interface LifeLineProps {
  class?: string;
  results?: TestResultWord[];
  days?: number;
}

// Component that, from given TestResultWord[] creates an svg life line chart
// The life line displays number of tests per day for the past month
export const LifeLine: Component<LifeLineProps> = props => {
  const days = () => props.days ?? 30;

  const resultsPerDay = createMemo(() => {
    const resultsDict = (props.results ?? []).reduce(
      (acc, result) => {
        const [dateKey] = result.created_at.split('T');
        acc[dateKey] = (acc[dateKey] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const today = new Date();
    const startDate = new Date(today.getTime() - days() * 24 * 60 * 60 * 1000);

    // Initialize array with past N days
    const daysArray = Array.from({ length: days() }, (_, i) => {
      const date = new Date(
        startDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000
      );
      const dateKey = date.toISOString().split('T')[0];

      return resultsDict[dateKey] ?? 0;
    });

    return daysArray;
  });

  const maxCount = createMemo(() => Math.max(...resultsPerDay(), 1));

  // Create SVG path from data points
  const path = createMemo(() => {
    const points: string[] = [];
    let secLastX: number | undefined;
    let secLastY: number | undefined;

    const results = resultsPerDay();
    const length = results.length;

    results.forEach((dayTestCount, i) => {
      const y = 100 - (dayTestCount / maxCount()) * 98; // I'm using 98% to make space for the stroke width
      const x = (i / (days() - 1)) * 100;

      // This whole section is optimized for using just one L command to draw one horizontal line,
      // instead of using multiple L commands to draw multiple small horizontal lines with the same y value.
      if (secLastY !== y || i === length - 1) {
        if (secLastX != null && secLastY != null) {
          points.push(`${secLastX},${secLastY}`);
        }
        points.push(`${x},${y}`);
        secLastY = y;
      }

      secLastX = x;
    });

    return `M ${points.join(' L ')}`;
  });

  return (
    <div
      class={cx(
        props.class,
        "relative after:absolute after:bottom-0 after:left-0 after:h-full after:w-full after:bg-gradient-to-t after:from-[#ffffffcc] after:to-transparent after:content-['']"
      )}
    >
      <svg
        viewBox="0 0 100 104"
        preserveAspectRatio="none"
        class="h-full w-full stroke-green-600"
      >
        <path
          d={path()}
          fill="none"
          stroke-width="2"
          stroke-linejoin="round"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};
