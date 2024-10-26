export function testProgressKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'progress'];
}

export function lastTestResultKey(vocabularyId: number) {
  return ['vocabulary', vocabularyId, 'lastResult'];
}
