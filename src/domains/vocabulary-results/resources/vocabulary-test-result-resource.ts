import type { QueryClient } from '@tanstack/solid-query';
import type {
  TestResult,
  TestResultToCreate,
} from '../model/test-result-model';
import type { VocabularyTestResultApi as VocabularyTestResultApi } from './vocabulary-test-result-api';
import { lastTestResultKey, testProgressKey } from './cache-keys';

let api: VocabularyTestResultApi;
let queryClient: QueryClient;

export const initVocabularyTestResultResource = (
  testResultApi: VocabularyTestResultApi,
  qClient: QueryClient
) => {
  api = testResultApi;
  queryClient = qClient;
};

export async function fetchLastTestResult(
  vocabularyId: number
): Promise<TestResult | undefined> {
  return await api.fetchLastTestResult(vocabularyId, { done: true });
}

export async function fetchTestProgress(
  vocabularyId: number
): Promise<TestResult | undefined> {
  return api.fetchLastTestResult(vocabularyId, { done: false });
}

export async function saveTestResult(testResult: TestResultToCreate) {
  const savedResult = await api.saveTestResult(testResult);

  if (testResult.done) {
    queryClient.setQueryData(testProgressKey(testResult.vocabulary_id), null);
    queryClient.setQueryData(
      lastTestResultKey(testResult.vocabulary_id),
      savedResult
    );
  } else {
    queryClient.setQueryData(
      testProgressKey(testResult.vocabulary_id),
      savedResult
    );
  }

  return savedResult;
}
