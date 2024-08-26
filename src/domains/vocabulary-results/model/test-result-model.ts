export enum TestWordStatus {
  NotDone,
  Skipped,
  Done,
}

export enum TestWordResult {
  Correct = 1,
  Ok,
  Mediocre,
  Wrong,
}

export interface TestResult {
  vocabularyId: number;
  updatedAt: Date;
  done: boolean;
  words: TestResultWord[];
}

export interface TestResultWord {
  id: number;
  invalidAttempts: number;
  status: TestWordStatus;
  result?: TestWordResult;
}
