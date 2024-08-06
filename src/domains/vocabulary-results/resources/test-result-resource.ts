import { get, set } from 'idb-keyval';
import type { TestResult } from '../model/test-result-model';
import type { RealOmit } from '~/util/object';

export async function fetchTestResults(vocabularyId: number) {
  const result = await get<TestResult>(
    `vocabulary.${vocabularyId}.lastTestResult`
  );

  return [result];
}

export async function saveTestResult(
  testResult: RealOmit<TestResult, 'updatedAt'>
) {
  const updatedResult: TestResult = { ...testResult, updatedAt: new Date() };
  await set(
    `vocabulary.${testResult.vocabularyId}.lastTestResult`,
    updatedResult
  );
}
