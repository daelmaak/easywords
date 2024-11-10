import type {
  TestResultDB,
  TestResultToCreateDB,
  TestResultWordDB,
  TestResultWordToCreateDB,
} from '../resources/vocabulary-test-result-api';
import type { PartialExcept } from '~/util/type';

export enum TestWordStatus {
  NotDone = 0,
  Correct,
  Good,
  Fair,
  Wrong,
}

export interface TestResult extends TestResultDB {
  words: TestResultWord[];
}

export interface TestResultWord extends TestResultWordDB {
  attempts?: TestWordStatus[];
  result: TestWordStatus;
}

export interface TestResultToCreate extends TestResultToCreateDB {
  words: TestResultWordToCreate[];
}

export type TestResultWordToCreate = PartialExcept<
  TestResultWordToCreateDB,
  'done' | 'result' | 'word_id'
>;
