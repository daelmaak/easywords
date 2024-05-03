import { vi } from 'vitest';
import { ResourcesInit, initApp } from './app-init';
import { createRoot } from 'solid-js';

export const initTestApp = () => {
  const resources = {
    vocabularyApi: {
      createVocabularyList: vi.fn(),
      createVocabularyItems: vi.fn(),
      deleteVocabularyItems: vi.fn(),
      deleteVocabularyList: vi.fn(),
      fetchVocabulary: vi.fn(),
      fetchVocabularyLists: vi.fn(),
      updateVocabulary: vi.fn(),
      updateVocabularyItems: vi.fn(),
    },
  } satisfies ResourcesInit;

  return createRoot(dispose => {
    initApp(resources);
    return { ...resources, dispose };
  });
};
