import { type VocabularyApi, type VocabularyDB } from './vocabulary-api';
import { transformToVocabulary } from './vocabulary-transform';

export const VOCABULARIES_QUERY_KEY = 'vocabularies';

let api: VocabularyApi;

export const initVocabulariesResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
};

export const fetchVocabularies = async () => {
  const vocabulariesDB = await api.fetchVocabularies();
  return transformToVocabularies(vocabulariesDB ?? []);
};

export const fetchRecentVocabularies = async (amount: number) => {
  const vocabulariesDB = await api.fetchRecentVocabularies(amount);
  return transformToVocabularies(vocabulariesDB ?? []);
};

const transformToVocabularies = (vocabulariesDB: VocabularyDB[]) => {
  return vocabulariesDB.map(transformToVocabulary);
};
