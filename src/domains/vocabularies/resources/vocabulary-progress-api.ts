import { get, set } from 'idb-keyval';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import type { RealOmit } from '~/util/object';

const deleteVocabularyProgress = async (vocabularyId: number) => {
  await set(`vocabulary.${vocabularyId}.progress`, undefined);
};

const fetchVocabularyProgress = async (vocabularyId: number) => {
  return await get<TestResult>(`vocabulary.${vocabularyId}.progress`);
};

const saveVocabularyProgress = async (
  testResult: RealOmit<TestResult, 'updated_at'>
) => {
  await set(
    `vocabulary.${testResult.vocabulary_id}.progress`,
    JSON.parse(JSON.stringify(testResult))
  );
};

export const vocabularyProgressApi = {
  deleteVocabularyProgress,
  fetchVocabularyProgress,
  saveVocabularyProgress,
};

export type VocabularyProgressApi = typeof vocabularyProgressApi;
