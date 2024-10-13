import type {
  TestResultDB,
  TestResultToCreateDB,
  TestResultWordDB,
  TestResultWordToCreateDB,
} from '../resources/vocabulary-test-result-api';
import type { PartialExcept } from '~/util/type';

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

export interface TestResult extends TestResultDB {
  words: TestResultWord[];
}

export interface TestResultWord extends TestResultWordDB {
  attempts?: TestWordResult[];
  result?: TestWordResult;
}

export interface TestResultToCreate extends TestResultToCreateDB {
  words: TestResultWordToCreate[];
}

export type TestResultWordToCreate = PartialExcept<
  TestResultWordToCreateDB,
  'status' | 'word_id'
>;
