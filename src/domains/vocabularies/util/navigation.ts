import type { Navigator } from '@solidjs/router';

export function navigateToVocabularyTest(
  vocabularyId: number,
  navigate: Navigator,
  config?: { wordIds?: number[]; useSavedProgress?: boolean }
) {
  let url = `/vocabulary/${vocabularyId}/test`;

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
