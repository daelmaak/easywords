import type { QueryClient } from '@tanstack/solid-query';
import type {
  TestResult,
  TestResultToCreate,
} from '../model/test-result-model';
import type { VocabularyTestResultApi as VocabularyTestResultApi } from './vocabulary-test-result-api';

let api: VocabularyTestResultApi;
let queryClient: QueryClient;

export const initVocabularyTestResultResource = (
  testResultApi: VocabularyTestResultApi,
  qClient: QueryClient
) => {
  api = testResultApi;
  queryClient = qClient;
};

export async function fetchTestResults(
  vocabularyId: number
): Promise<TestResult | undefined> {
  return await api.fetchLastTestResult(vocabularyId);
}

export async function fetchTestProgress(
  vocabularyId: number
): Promise<TestResult | undefined> {
  return api.fetchLastTestResult(vocabularyId, { done: false });
}

export async function saveTestResult(testResult: TestResultToCreate) {
  const savedResult = await api.saveTestResult(testResult);

  queryClient.setQueryData(
    ['vocabulary', testResult.vocabulary_id, 'progress'],
    savedResult
  );

  return savedResult;
}
