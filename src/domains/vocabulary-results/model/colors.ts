import { TestWordResult } from './test-result-model';

export const RESULT_COLORS: Record<TestWordResult, string> = {
  [TestWordResult.Correct]: '#158a66f2',
  [TestWordResult.Ok]: '#acba5c',
  [TestWordResult.Mediocre]: '#ff9037',
  [TestWordResult.Wrong]: '#c64072',
};

export type ResultColor = (typeof RESULT_COLORS)[keyof typeof RESULT_COLORS];
