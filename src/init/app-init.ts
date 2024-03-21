import {
  VocabularyApi,
  vocabularyApi,
} from '~/domains/vocabularies/resources/vocabulary-api';
import { initVocabularyResources } from '~/domains/vocabularies/resources/vocabulary-resources';

export interface ResourcesInit {
  vocabularyApi: VocabularyApi;
}

export const initApp = (init?: ResourcesInit) => {
  initResources(
    init ?? {
      vocabularyApi,
    }
  );
};

export const initResources = (init: { vocabularyApi: VocabularyApi }) => {
  initVocabularyResources(init.vocabularyApi);
};
