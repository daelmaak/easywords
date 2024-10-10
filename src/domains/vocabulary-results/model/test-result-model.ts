export enum TestWordStatus {
  NotDone,
  Done,
  Skipped,
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
  attempts: TestWordResult[];
  status: TestWordStatus;
  result?: TestWordResult;
}
