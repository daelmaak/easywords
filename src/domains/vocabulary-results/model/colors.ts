import { TestWordStatus } from './test-result-model';

export const RESULT_COLORS: Record<TestWordStatus, string> = {
  [TestWordStatus.NotDone]: '#817777',
  [TestWordStatus.Correct]: '#158a66f2',
  [TestWordStatus.Ok]: '#acba5c',
  [TestWordStatus.Mediocre]: '#ff9037',
  [TestWordStatus.Wrong]: '#c64072',
};

export type ResultColor = (typeof RESULT_COLORS)[keyof typeof RESULT_COLORS];
