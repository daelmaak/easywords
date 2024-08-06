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

export interface ResourcesInit {
  vocabularyApi: VocabularyApi;
  vocabularyProgressApi: VocabularyProgressApi;
}

export const initApp = (init?: ResourcesInit) => {
  initResources(
    init ?? {
      vocabularyApi,
      vocabularyProgressApi,
    }
  );
};

export const initResources = ({
  vocabularyApi,
  vocabularyProgressApi,
}: ResourcesInit) => {
  initVocabulariesResource({ vocabularyApi, vocabularyProgressApi });
  initVocabularyResource({ vocabularyApi, vocabularyProgressApi });
};

export const resetApp = () => {
  resetVocabulariesResource();
  resetVocabularyResource();
};
