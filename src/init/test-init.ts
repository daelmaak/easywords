import { vi } from 'vitest';
import { ResourcesInit, initApp } from './app-init';
import { createRoot } from 'solid-js';

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
  } satisfies ResourcesInit;

  return createRoot(dispose => {
    initApp(resources);
    return { ...resources, dispose };
  });
};
