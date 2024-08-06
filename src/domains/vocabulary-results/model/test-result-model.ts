export interface TestResult {
  vocabularyId: number;
  updatedAt: Date;
  done: boolean;
  words: TestResultWord[];
}

export interface TestResultWord {
  id: number;
  done: boolean;
  invalidAttempts: number;
  skipped: boolean;
}
