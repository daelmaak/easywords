import { TestWordStatus } from './test-result-model';

export const RESULT_COLORS: Record<TestWordStatus, string> = {
  [TestWordStatus.NotDone]: '#817777',
  [TestWordStatus.Correct]: 'rgb(15, 138, 73)',
  [TestWordStatus.Good]: 'rgb(144, 173, 48)',
  [TestWordStatus.Fair]: 'rgb(193, 145, 0)',
  [TestWordStatus.Wrong]: 'rgb(173, 8, 8)',
};

export type ResultColor = (typeof RESULT_COLORS)[keyof typeof RESULT_COLORS];
