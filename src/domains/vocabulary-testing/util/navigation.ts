import type { Navigator } from '@solidjs/router';
import { Routes } from '~/routes/routes';

export function navigateToVocabularyTest(
  vocabularyId: number,
  navigate: Navigator,
  config?: { wordIds?: number[]; useSavedProgress?: boolean }
) {
  let url = `${Routes.Vocabularies}/${vocabularyId}/test`;

  if (config) {
    url += '?';
  }

  if (config?.useSavedProgress) {
    url += 'useSavedProgress=true';
  }

  if (config?.wordIds) {
    url += 'wordIds=' + config.wordIds.join(',');
  }

  navigate(url);
}
