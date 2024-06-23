import { ResourceReturn, createResource } from 'solid-js';
import { Vocabulary } from '../model/vocabulary-model';
import { VocabularyApi, VocabularyToCreate } from './vocabulary-api';

let api: VocabularyApi;
let vocabulariesResource: ResourceReturn<Vocabulary[]> | undefined;

export const initVocabulariesResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
};

export const getVocabulariesResource = () => {
  if (!vocabulariesResource) {
    vocabulariesResource = createResource(api.fetchVocabularies);
  }
  return vocabulariesResource;
};

export const createVocabulary = async (vocabulary: VocabularyToCreate) => {
  const success = await api.createVocabularyList(vocabulary);

  if (success) {
    const { refetch } = getVocabulariesResource()[1];
    refetch();
  }

  return success;
};

export const deleteVocabulary = async (id: number) => {
  const success = await api.deleteVocabularyList(id);

  if (success) {
    const { mutate } = getVocabulariesResource()[1];
    mutate(l => l!.filter(list => list.id !== id));
  }

  return success;
};
