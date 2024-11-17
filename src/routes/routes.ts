export const Routes = {
  Dashboard: '/dashboard',
  Vocabularies: '/vocabularies',
  Conjugations: '/conjugations',
  Login: '/login',
  Signup: '/signup',
  Vocabulary: '/vocabularies/:id',
  VocabularyTest: [`/vocabularies/:id/test`, '/vocabularies/:id/test/:testId'],
  VocabularyTestResults: '/vocabularies/:id/test/:testId/results',
};

export function testRoute(vocabularyId: number, testId?: number) {
  return `${Routes.Vocabularies}/${vocabularyId}/test${
    testId ? `/${testId}` : ''
  }`;
}

export function testResultsRoute(vocabularyId: number, testId: number) {
  return `${Routes.Vocabularies}/${vocabularyId}/test/${testId}/results`;
}

export function vocabularyRoute(vocabularyId: number) {
  return `${Routes.Vocabularies}/${vocabularyId}`;
}
