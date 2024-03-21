import { ResourceReturn, createResource } from 'solid-js';
import { WordTranslation } from '~/model/word-translation';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';
import { VocabularyApi } from './vocabulary-api';

let api: VocabularyApi;
let vocabulariesResource: ResourceReturn<VocabularyList[]> | undefined;

export const initVocabularyResources = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
};

export const getVocabulariesResource = () => {
  if (!vocabulariesResource) {
    vocabulariesResource = createResource(api.fetchVocabularyLists);
  }
  return vocabulariesResource;
};

export const createVocabulary = async (
  name: string,
  items: WordTranslation[]
) => {
  const success = await api.createVocabularyList(name, items);

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

export const getVocabulary = (id: number) => {
  const [vocabularies] = getVocabulariesResource();
  return vocabularies()?.find(v => v.id === id);
};

export const updateVocabularyItem = async (
  vocabularyId: number,
  item: VocabularyItem
) => {
  const result = await api.updateVocabularyItem(item);
  const [_, { mutate }] = getVocabulariesResource();

  if (!result) {
    return false;
  }

  mutate(vs =>
    vs!.map(v => {
      if (v.id !== vocabularyId) {
        return v;
      }
      return {
        ...v,
        vocabularyItems: v.vocabularyItems.map(i =>
          i.id === item.id ? item : i
        ),
      };
    })
  );

  return true;
};
