import { get, set } from 'idb-keyval';
import type { TestResult } from '../model/test-result-model';
import type { RealOmit } from '~/util/object';

export async function fetchTestResults(vocabularyId: number) {
  const result = await get<TestResult>(
    `vocabulary.${vocabularyId}.lastTestResult`
  );

  return result;
}

export async function saveTestResult(
  testResult: RealOmit<TestResult, 'updatedAt'>
) {
  const updatedResult: TestResult = {
    ...testResult,
    // I have to de-reactify the words array as it's tracked by Solid, meaning there are
    // Symbols and Proxies which can't be cloned by idb-keyval using structuredClone().
    words: testResult.words.map(w => ({ ...w })),
    updatedAt: new Date(),
  };
  await set(
    `vocabulary.${testResult.vocabularyId}.lastTestResult`,
    updatedResult
  );
}
