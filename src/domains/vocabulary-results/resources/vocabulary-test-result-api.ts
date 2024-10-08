import { get, set } from 'idb-keyval';
import type { RealOmit } from '~/util/object';
import type { TestResult } from '../model/test-result-model';
import { supabase } from '~/lib/supabase-client';

async function fetchTestResultsLocal(vocabularyId: number) {
  const result = await get<TestResult>(
    `vocabulary.${vocabularyId}.lastTestResult`
  );

  return result;
}

async function saveTestResultLocal(
  testResult: RealOmit<TestResult, 'updatedAt'>
) {
  const updatedResult: TestResult = {
    ...testResult,
    // I have to de-reactify the words array as it's tracked by Solid, meaning there are
    // Symbols and Proxies which can't be cloned by idb-keyval using structuredClone().
    words: testResult.words.map(w => ({ ...w, attempts: [...w.attempts] })),
    updatedAt: new Date(),
  };
  await set(
    `vocabulary.${testResult.vocabularyId}.lastTestResult`,
    updatedResult
  );
}

export const vocabularyTestResultApi = {
  fetchTestResultsLocal,
  saveTestResultLocal,
};

export type VocabularyTestResultApi = typeof vocabularyTestResultApi;
