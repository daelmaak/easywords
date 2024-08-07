import { createRoot } from 'solid-js';
import { vi } from 'vitest';
import type { ResourcesInit } from './app-init';
import { initApp } from './app-init';

export const initTestApp = () => {
  const resources = {
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
  } satisfies ResourcesInit;

  return createRoot(dispose => {
    initApp(resources);
    return { ...resources, dispose };
  });
};
