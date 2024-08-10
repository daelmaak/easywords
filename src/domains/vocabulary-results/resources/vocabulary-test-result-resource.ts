import type { TestResult } from '../model/test-result-model';
import type { RealOmit } from '~/util/object';
import type { VocabularyTestResultApi as VocabularyTestResultApi } from './vocabulary-test-result-api';

export type TestResultToCreate = RealOmit<TestResult, 'updatedAt'>;

let api: VocabularyTestResultApi;

export const initVocabularyTestResultResource = (
  testResultApi: VocabularyTestResultApi
) => {
  api = testResultApi;
};

export function fetchTestResults(vocabularyId: number) {
  return api.fetchTestResults(vocabularyId);
}

export function saveTestResult(testResult: TestResultToCreate) {
  return api.saveTestResult(testResult);
}
