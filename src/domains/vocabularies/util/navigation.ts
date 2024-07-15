import type { Navigator } from '@solidjs/router';

export function navigateToVocabularyTest(
  id: number,
  navigate: Navigator,
  config?: { useSavedProgress: boolean }
) {
  let url = `/vocabulary/${id}/test`;

  if (config?.useSavedProgress) {
    url += '?useSavedProgress=true';
  }

  navigate(url);
}
