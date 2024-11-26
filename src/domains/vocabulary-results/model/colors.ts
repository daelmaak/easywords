import { TestWordStatus } from './test-result-model';

export const RESULT_COLORS: Record<TestWordStatus, string> = {
  [TestWordStatus.NotDone]: '#879292',
  [TestWordStatus.Correct]: 'rgb(8, 137, 85)',
  [TestWordStatus.Good]: 'rgb(164, 190, 76)',
  [TestWordStatus.Fair]: 'rgb(200, 155, 18)',
  [TestWordStatus.Wrong]: 'rgb(215, 69, 126)',
};

export type ResultColor = (typeof RESULT_COLORS)[keyof typeof RESULT_COLORS];
