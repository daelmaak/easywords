import { vi } from 'vitest';
import { ResourcesInit, initApp } from './app-init';

export const initTestApp = () => {
  const resources = {
    vocabularyApi: {
      fetchVocabularyLists: vi.fn(),
      createVocabularyList: vi.fn(),
      deleteVocabularyList: vi.fn(),
      updateVocabularyItems: vi.fn(),
    },
  } satisfies ResourcesInit;

  initApp(resources);

  return resources;
};
