import type { VocabularyApi, VocabularyDB } from './vocabulary-api';
import type { VocabularyProgressApi } from './vocabulary-progress-api';
import { transformToVocabulary } from './vocabulary-transform';

export const VOCABULARIES_QUERY_KEY = 'vocabularies';

let api: VocabularyApi;
let progressApi: VocabularyProgressApi;

export const initVocabulariesResource = (apis: {
  vocabularyApi: VocabularyApi;
  vocabularyProgressApi: VocabularyProgressApi;
}) => {
  ({ vocabularyApi: api, vocabularyProgressApi: progressApi } = apis);
};

export const fetchVocabularies = async () => {
  const vocabulariesDB = await api.fetchVocabularies();
  return transformToVocabularies(vocabulariesDB ?? []);
};

export const fetchRecentVocabularies = async (amount: number) => {
  const vocabulariesDB = await api.fetchRecentVocabularies(amount);
  return transformToVocabularies(vocabulariesDB ?? []);
};

const transformToVocabularies = async (vocabulariesDB: VocabularyDB[]) => {
  const vocabularies = vocabulariesDB.map(transformToVocabulary);

  // TODO: This is only temporary and should be ultimately saved in DB
  for (const vocabulary of vocabularies) {
    const progress = await progressApi.fetchVocabularyProgress(vocabulary.id);
    vocabulary.savedProgress = progress;
  }

  return vocabularies;
};
