export function testResultKey(testId: number) {
  return ['vocabulary-test-result', testId];
}

export function testResultsKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'results'];
}

export function lastTestProgressKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'lastProgress'];
}

export function lastTestResultKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'lastResult'];
}

export function previousWordResults(testId: number) {
  return ['previous-word-results', testId];
}

export function wordResultsKey(wordId: number) {
  return ['word-results', wordId];
}
