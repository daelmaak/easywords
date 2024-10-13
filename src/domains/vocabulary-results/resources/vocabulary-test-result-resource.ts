import type {
  TestResult,
  TestResultToCreate,
} from '../model/test-result-model';
import type { VocabularyTestResultApi as VocabularyTestResultApi } from './vocabulary-test-result-api';

let api: VocabularyTestResultApi;

export const initVocabularyTestResultResource = (
  testResultApi: VocabularyTestResultApi
) => {
  api = testResultApi;
};

export async function fetchTestResults(
  vocabularyId: number
): Promise<TestResult | undefined> {
  return await api.fetchLastTestResult(vocabularyId);
}

export function saveTestResult(testResult: TestResultToCreate) {
  return api.saveTestResult(testResult);
}
