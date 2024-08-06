import { get, set } from 'idb-keyval';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import type { RealOmit } from '~/util/object';

export const deleteVocabularyProgress = async (vocabularyId: number) => {
  await set(`vocabulary.${vocabularyId}.progress`, undefined);
};

export const fetchVocabularyProgress = async (vocabularyId: number) => {
  return await get<TestResult>(`vocabulary.${vocabularyId}.progress`);
};

export const saveVocabularyProgress = async (
  testResult: RealOmit<TestResult, 'updatedAt'>
) => {
  await set(
    `vocabulary.${testResult.vocabularyId}.progress`,
    JSON.parse(JSON.stringify(testResult))
  );
};
