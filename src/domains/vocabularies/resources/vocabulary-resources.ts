import { ResourceReturn, createResource } from 'solid-js';
import { VocabularyItem, Vocabulary } from '../vocabulary-model';
import { VocabularyApi } from './vocabulary-api';

let api: VocabularyApi;
let vocabulariesResource: ResourceReturn<Vocabulary[]> | undefined;

export const initVocabularyResources = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
};

export const getVocabulariesResource = () => {
  if (!vocabulariesResource) {
    vocabulariesResource = createResource(api.fetchVocabularyLists);
  }
  return vocabulariesResource;
};

export const createVocabulary = async (vocabulary: Vocabulary) => {
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

export const getVocabulary = (id: number) => {
  const [vocabularies] = getVocabulariesResource();
  return vocabularies()?.find(v => v.id === id);
};

export const updateVocabularyItems = async (
  vocabularyId: number,
  ...itemsToUpdate: VocabularyItem[]
) => {
  const items = itemsToUpdate.map(i => ({ ...i, list_id: vocabularyId }));
  const result = await api.updateVocabularyItems(items);
  const [_, { mutate }] = getVocabulariesResource();

  if (!result) {
    return false;
  }

  const updatedItemsMap = new Map(items.map(i => [i.id, i]));

  mutate(vs =>
    vs!.map(v => {
      if (v.id !== vocabularyId) {
        return v;
      }
      return {
        ...v,
        vocabularyItems: v.vocabularyItems.map(
          i => updatedItemsMap.get(i.id) ?? i
        ),
      };
    })
  );

  return true;
};
