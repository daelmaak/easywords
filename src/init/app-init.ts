import {
  initVocabulariesResource,
  resetVocabulariesResource,
} from '~/domains/vocabularies/resources/vocabularies-resource';
import type { VocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import { vocabularyApi } from '~/domains/vocabularies/resources/vocabulary-api';
import type { VocabularyProgressApi } from '~/domains/vocabularies/resources/vocabulary-progress-api';
import { vocabularyProgressApi } from '~/domains/vocabularies/resources/vocabulary-progress-api';
import {
  initVocabularyResource,
  resetVocabularyResource,
} from '~/domains/vocabularies/resources/vocabulary-resource';
import {
  vocabularyTestResultApi,
  type VocabularyTestResultApi,
} from '~/domains/vocabulary-results/resources/vocabulary-test-result-api';
import { initVocabularyTestResultResource } from '~/domains/vocabulary-results/resources/vocabulary-test-result-resource';

export interface ResourcesInit {
  vocabularyApi: VocabularyApi;
  vocabularyProgressApi: VocabularyProgressApi;
  vocabularyTestResultApi: VocabularyTestResultApi;
}

export const initApp = (init?: ResourcesInit) => {
  initResources(
    init ?? {
      vocabularyApi,
      vocabularyProgressApi,
      vocabularyTestResultApi,
    }
  );
};

export const initResources = ({
  vocabularyApi,
  vocabularyProgressApi,
  vocabularyTestResultApi,
}: ResourcesInit) => {
  initVocabulariesResource({ vocabularyApi, vocabularyProgressApi });
  initVocabularyResource({ vocabularyApi, vocabularyProgressApi });
  initVocabularyTestResultResource(vocabularyTestResultApi);
};

export const resetApp = () => {
  resetVocabulariesResource();
  resetVocabularyResource();
};
