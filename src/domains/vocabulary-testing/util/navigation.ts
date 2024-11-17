import type { Navigator } from '@solidjs/router';
import { Routes } from '~/routes/routes';

export function navigateToVocabularyTest(
  vocabularyId: number,
  navigate: Navigator,
  config?: { wordIds?: number[]; testId?: number }
) {
  let url = `${Routes.Vocabularies}/${vocabularyId}/test`;

  if (config?.testId) {
    url += `/${config.testId}`;
    navigate(url);
    return;
  }

  if (config?.wordIds) {
    url += '?wordIds=' + config.wordIds.join(',');
  }
  navigate(url);
}
