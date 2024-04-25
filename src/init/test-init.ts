import { vi } from 'vitest';
import { ResourcesInit, initApp } from './app-init';

export const initTestApp = () => {
  const resources = {
    vocabularyApi: {
      createVocabularyList: vi.fn(),
      createVocabularyItems: vi.fn(),
      deleteVocabularyList: vi.fn(),
      fetchVocabularyLists: vi.fn(),
      updateVocabulary: vi.fn(),
      updateVocabularyItems: vi.fn(),
    },
  } satisfies ResourcesInit;

  initApp(resources);

  return resources;
};
