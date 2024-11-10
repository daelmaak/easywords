import { TestWordStatus } from '~/domains/vocabulary-results/model/test-result-model';

export const TEST_RESULT_LABELS: Record<TestWordStatus, string> = {
  [TestWordStatus.NotDone]: 'Not done',
  [TestWordStatus.Correct]: 'Perfect',
  [TestWordStatus.Good]: 'Good',
  [TestWordStatus.Fair]: 'Fair',
  [TestWordStatus.Wrong]: 'Wrong',
} as const;
