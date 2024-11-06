import { initVocabulariesResource } from '~/domains/vocabularies/resources/vocabularies-resource';
import type { VocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import { vocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
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
      vocabularyTestResultApi,
    }
  );

  return { queryClient };
};

export const initResources = ({
  queryClient,
  vocabularyApi,
  vocabularyTestResultApi,
}: ResourcesInit) => {
  initVocabulariesResource(vocabularyApi);
  initVocabularyResource(
    { vocabularyApi, testResultApi: vocabularyTestResultApi },
    queryClient
  );
  initVocabularyTestResultResource(vocabularyTestResultApi, queryClient);
};

export const resetApp = () => {
  queryClient.clear();
};
