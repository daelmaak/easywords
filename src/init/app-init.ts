import { initVocabulariesResource } from '~/domains/vocabularies/resources/vocabularies-resource';
import {
  VocabularyApi,
  vocabularyApi,
} from '~/domains/vocabularies/resources/vocabulary-api';
import { initVocabularyResource } from '~/domains/vocabularies/resources/vocabulary-resource';

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
  initVocabulariesResource(init.vocabularyApi);
  initVocabularyResource(init.vocabularyApi);
};
