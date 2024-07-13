import { ResourceReturn, createResource } from 'solid-js';
import { Vocabulary } from '../model/vocabulary-model';
import {
  VocabularyApi,
  VocabularyDB,
  VocabularyToCreateDB,
} from './vocabulary-api';
import {
  transformToVocabulary,
  transformToVocabularyItemDB,
} from './vocabulary-transform';
import { fetchVocabularyProgress } from './vocabulary-progress-api';
import { RealOmit } from '../../../util/object';

export type VocabularyToCreate = RealOmit<
  Vocabulary,
  'id' | 'hasSavedProgress'
>;

let api: VocabularyApi;
let vocabulariesResource: ResourceReturn<Vocabulary[]> | undefined;

export const initVocabulariesResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
};

export const getVocabulariesResource = () => {
  if (!vocabulariesResource) {
    vocabulariesResource = createResource(async () => {
      const vocabulariesDB = await api.fetchVocabularies();
      return transformToVocabularies(vocabulariesDB ?? []);
    });
  }
  return vocabulariesResource;
};

export const createVocabulary = async (vocabulary: VocabularyToCreate) => {
  const vocabularyDB = transformToVocabularyCreateDB(vocabulary);
  const success = await api.createVocabulary(vocabularyDB);

  if (success) {
    const { refetch } = getVocabulariesResource()[1];
    refetch();
  }

  return success;
};

export const deleteVocabulary = async (id: number) => {
  const success = await api.deleteVocabulary(id);

  if (success) {
    const { mutate } = getVocabulariesResource()[1];
    mutate(l => l!.filter(list => list.id !== id));
  }

  return success;
};

export const fetchRecentVocabularies = async (amount: number) => {
  const vocabulariesDB = await api.fetchRecentVocabularies(amount);
  return transformToVocabularies(vocabulariesDB ?? []);
};

const transformToVocabularies = async (vocabulariesDB: VocabularyDB[]) => {
  const vocabularies = vocabulariesDB.map(transformToVocabulary);

  // TODO: This is only temporary and should be ultimately saved in DB
  for (const vocabulary of vocabularies) {
    const progress = await fetchVocabularyProgress(vocabulary.id);
    vocabulary.hasSavedProgress = Boolean(progress);
  }

  return vocabularies;
};

const transformToVocabularyCreateDB = (
  vocabulary: VocabularyToCreate
): VocabularyToCreateDB => ({
  country: vocabulary.country,
  name: vocabulary.name,
  vocabulary_items: vocabulary.vocabularyItems.map(transformToVocabularyItemDB),
});
