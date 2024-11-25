import { TestWordStatus } from '~/domains/vocabulary-results/model/test-result-model';

export const TEST_RESULT_LABELS: Record<TestWordStatus, string> = {
  [TestWordStatus.NotDone]: 'Skipped',
  [TestWordStatus.Correct]: 'Perfect',
  [TestWordStatus.Good]: 'Almost',
  [TestWordStatus.Fair]: 'Meh',
  [TestWordStatus.Wrong]: 'Nope',
} as const;
