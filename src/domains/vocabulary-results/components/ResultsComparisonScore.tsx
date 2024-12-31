import { createMemo } from 'solid-js';
import { TestWordStatus } from '../model/test-result-model';
import type {
  PreviousWordResult,
  TestResult,
} from '../model/test-result-model';
import {
  HiOutlineArrowTrendingDown,
  HiOutlineArrowTrendingUp,
  HiOutlineMinus,
} from 'solid-icons/hi';

interface ResultsComparisonProps {
  testResult: TestResult;
  previousWordResults: PreviousWordResult[];
}

const calculateComparisonScore = (
  testResult: TestResult,
  previousWordResults: PreviousWordResult[]
): number => {
  const previousResultsMap = new Map(
    previousWordResults.map(prev => [prev.word_id, prev])
  );

  let improvementScore = 0;
  // TODO: @daelmaak are those needed?
  let totalComparisons = 0;

  testResult.words.forEach(currentWord => {
    if (currentWord.result === TestWordStatus.NotDone) {
      return;
    }

    const previousResult = previousResultsMap.get(currentWord.word_id);

    if (!previousResult) {
      return;
    }

    totalComparisons++;
    improvementScore += previousResult.average_result - currentWord.result;
  });

  return improvementScore / totalComparisons;
};

export function ResultsComparisonScore(props: ResultsComparisonProps) {
  const score = createMemo(() =>
    calculateComparisonScore(props.testResult, props.previousWordResults)
  );

  const scorePercent = () =>
    Math.abs(
      (score() / (TestWordStatus.Wrong - TestWordStatus.Correct)) * 100
    ).toFixed(0);

  return (
    <div class="flex items-center gap-2">
      <div class="flex flex-col items-center">
        <span class="text-6xl">
          {score() > 0 ? (
            <HiOutlineArrowTrendingUp class="text-green-500" />
          ) : score() < 0 ? (
            <HiOutlineArrowTrendingDown class="text-red-500" />
          ) : (
            <HiOutlineMinus class="text-gray-500" />
          )}
        </span>
        <span class="text-4xl">{scorePercent()}%</span>
        <span>{score() >= 0 ? 'Improvement' : 'Decrease'}</span>
        <span class="text-xs text-gray-500">Compared to the last 3 tests</span>
      </div>
    </div>
  );
}
