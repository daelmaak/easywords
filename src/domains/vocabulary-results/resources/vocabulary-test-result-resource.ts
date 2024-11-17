import type { QueryClient } from '@tanstack/solid-query';
import {
  TestWordStatus,
  type TestResult,
  type TestResultToCreate,
  type TestResultWord,
} from '../model/test-result-model';
import type { VocabularyTestResultApi } from './vocabulary-test-result-api';
import { lastTestResultKey, testResultKey, testResultsKey } from './cache-keys';
import type {
  Vocabulary,
  Word,
} from '~/domains/vocabularies/model/vocabulary-model';

export const VOCABULARY_WITH_RESULTS_QUERY_KEY = 'vocabularyWithResults';

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
): Promise<TestResult | null> {
  return await api.fetchLastTestResult(vocabularyId, { done: true });
}

export async function fetchLastTestProgress(
  vocabularyId: number
): Promise<TestResult | null> {
  return await api.fetchLastTestResult(vocabularyId, { done: false });
}

export async function fetchWordResults(
  wordId: number
): Promise<TestResultWord[] | undefined> {
  return api.fetchWordResults(wordId, { upToDaysAgo: 30 });
}

export async function fetchTestResult(
  testId: number
): Promise<TestResult | null> {
  return api.fetchTestResult(testId);
}

export async function fetchTestResults(
  vocabularyId: number,
  options: { upToDaysAgo: number }
): Promise<TestResult[]> {
  return api.fetchTestResults(vocabularyId, options);
}

export async function createTestResult(vocabulary: Vocabulary, words?: Word[]) {
  return await saveTestResult({
    vocabulary_id: vocabulary.id,
    words: (words ?? vocabulary.words).map(w => ({
      attempts: [],
      word_id: w.id,
      result: TestWordStatus.NotDone,
      done: false,
    })),
    done: false,
  });
}

export async function saveTestResult(testResult: TestResultToCreate) {
  const savedResult = await api.saveTestResult(testResult);

  if (testResult.done) {
    queryClient.setQueryData(testResultKey(testResult.vocabulary_id), null);
    queryClient.setQueryData(
      lastTestResultKey(testResult.vocabulary_id),
      savedResult
    );
    void queryClient.invalidateQueries({
      queryKey: testResultsKey(testResult.vocabulary_id),
    });
  } else {
    queryClient.setQueryData(testResultKey(savedResult.id), savedResult);
  }

  return savedResult;
}
