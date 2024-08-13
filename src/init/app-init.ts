import { initVocabulariesResource } from '~/domains/vocabularies/resources/vocabularies-resource';
import type { VocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import { vocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import type { VocabularyProgressApi } from '~/domains/vocabularies/resources/vocabulary-progress-api';
import { vocabularyProgressApi } from '~/domains/vocabularies/resources/vocabulary-progress-api';
import { initVocabularyResource } from '~/domains/vocabularies/resources/vocabulary-resource';
import {
  vocabularyTestResultApi,
  type VocabularyTestResultApi,
} from '~/domains/vocabulary-results/resources/vocabulary-test-result-api';
import { initVocabularyTestResultResource } from '~/domains/vocabulary-results/resources/vocabulary-test-result-resource';
import { QueryClient } from '@tanstack/solid-query';

export interface ResourcesInit {
  queryClient: QueryClient;
  vocabularyApi: VocabularyApi;
  vocabularyProgressApi: VocabularyProgressApi;
  vocabularyTestResultApi: VocabularyTestResultApi;
}

let queryClient: QueryClient;

export const initApp = (init?: ResourcesInit) => {
  queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
      },
    },
  });

  initResources(
    init ?? {
      queryClient,
      vocabularyApi,
      vocabularyProgressApi,
      vocabularyTestResultApi,
    }
  );

  return { queryClient };
};

export const initResources = ({
  queryClient,
  vocabularyApi,
  vocabularyProgressApi,
  vocabularyTestResultApi,
}: ResourcesInit) => {
  initVocabulariesResource({ vocabularyApi, vocabularyProgressApi });
  initVocabularyResource({ vocabularyApi, vocabularyProgressApi }, queryClient);
  initVocabularyTestResultResource(vocabularyTestResultApi);
};

export const resetApp = () => {
  queryClient.clear();
};
