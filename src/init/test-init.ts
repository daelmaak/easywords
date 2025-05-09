import { createRoot, createSignal } from 'solid-js';
import { vi } from 'vitest';
import type { ResourcesInit } from './app-init';
import { initApp } from './app-init';
import { QueryClient } from '@tanstack/solid-query';

export const initTestApp = () => {
  vi.mock(import('@solid-primitives/media'), async importOriginal => {
    const mod = await importOriginal(); // type is inferred
    return {
      ...mod,
      // replace some exports
      createMediaQuery: vi.fn().mockReturnValue(() => createSignal(true)),
    };
  });

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
      createWords: vi.fn(),
      deleteWords: vi.fn(),
      deleteVocabulary: vi.fn(),
      fetchVocabulary: vi.fn(),
      fetchVocabularies: vi.fn(),
      fetchRecentVocabularies: vi.fn(),
      updateVocabulary: vi.fn(),
      updateWords: vi.fn(),
    },
    vocabularyTestResultApi: {
      deleteTestResult: vi.fn(),
      fetchTestResult: vi.fn(),
      fetchTestResults: vi.fn(),
      fetchWordResults: vi.fn(),
      fetchLastTestResult: vi.fn().mockResolvedValue(null),
      fetchPreviousWordResults: vi.fn().mockResolvedValue(null),
      hasTestProgress: vi.fn(),
      saveTestResult: vi
        .fn()
        .mockImplementation(tr => Promise.resolve({ ...tr, id: 1 })),
    },
  } satisfies ResourcesInit;

  return createRoot(dispose => {
    initApp(resources);
    return { ...resources, dispose };
  });
};
