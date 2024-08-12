import { createRoot } from 'solid-js';
import { vi } from 'vitest';
import type { ResourcesInit } from './app-init';
import { initApp } from './app-init';
import { vocabularyTestResultTestApiFactory } from '~/domains/vocabulary-results/test/vocabulary-test-result-test-api';
import { QueryClient } from '@tanstack/solid-query';

export const initTestApp = () => {
  const resources = {
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
        },
      },
    }),
    vocabularyApi: {
      createVocabulary: vi.fn(),
      createVocabularyItems: vi.fn(),
      deleteVocabularyItems: vi.fn(),
      deleteVocabulary: vi.fn(),
      fetchVocabulary: vi.fn(),
      fetchVocabularies: vi.fn(),
      fetchRecentVocabularies: vi.fn(),
      updateVocabulary: vi.fn(),
      updateVocabularyItems: vi.fn(),
    },
    vocabularyProgressApi: {
      deleteVocabularyProgress: vi.fn(),
      fetchVocabularyProgress: vi.fn(),
      saveVocabularyProgress: vi.fn(),
    },
    vocabularyTestResultApi: vocabularyTestResultTestApiFactory(),
  } satisfies ResourcesInit;

  return createRoot(dispose => {
    initApp(resources);
    return { ...resources, dispose };
  });
};
