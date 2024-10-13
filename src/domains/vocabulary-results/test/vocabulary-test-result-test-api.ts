import type { TestResultToCreate } from '../model/test-result-model';
import type {
  TestResultDB,
  VocabularyTestResultApi,
} from '../resources/vocabulary-test-result-api';

export const vocabularyTestResultTestApiFactory: () => VocabularyTestResultApi =
  () => {
    const store = new Map<number, TestResultDB>();

    const fetchLastTestResult = (vocabularyId: number) => {
      return Promise.resolve(store.get(vocabularyId)!);
    };
    const saveTestResult = (testResult: TestResultToCreate) => {
      const result: TestResultDB = {
        ...testResult,
        id: 1,
        done: true,
        created_at: new Date().toISOString(),
        words: testResult.words.map(w => ({
          ...w,
          created_at: new Date().toISOString(),
        })),
        updated_at: new Date().toISOString(),
      };
      store.set(testResult.vocabulary_id, result);

      return Promise.resolve(result);
    };

    return {
      fetchLastTestResult,
      saveTestResult,
    };
  };
