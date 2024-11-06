export function testProgressKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'progress'];
}

export function testResultsKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'results'];
}

export function lastTestResultKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'lastResult'];
}

export function wordResultsKey(wordId: number) {
  return ['wordResults', wordId];
}
