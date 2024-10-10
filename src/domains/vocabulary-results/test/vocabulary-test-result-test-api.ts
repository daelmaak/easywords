import type { TestResult } from '../model/test-result-model';
import type { VocabularyTestResultApi } from '../resources/vocabulary-test-result-api';
import type { TestResultToCreate } from '../resources/vocabulary-test-result-resource';

export const vocabularyTestResultTestApiFactory: () => VocabularyTestResultApi =
  () => {
    const store = new Map<number, TestResult>();

    const fetchTestResults = (vocabularyId: number) => {
      return Promise.resolve(store.get(vocabularyId));
    };
    const saveTestResult = async (testResult: TestResultToCreate) => {
      await store.set(testResult.vocabularyId, {
        ...testResult,
        updatedAt: new Date(),
      });
    };

    return {
      fetchTestResultsLocal: fetchTestResults,
      saveTestResultLocal: saveTestResult,
    };
  };
