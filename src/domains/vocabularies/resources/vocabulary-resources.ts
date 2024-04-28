import { ResourceReturn, createResource } from 'solid-js';
import { VocabularyItem, Vocabulary } from '../model/vocabulary-model';
import {
    VocabularyApi,
    VocabularyItemToCreate,
    VocabularyToCreate,
} from './vocabulary-api';

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

export const getVocabulary = (id: number) => {
  const [vocabularies] = getVocabulariesResource();
  return vocabularies()?.find(v => v.id === id);
};

export const updateVocabulary = async (
  vocabularyPatch: Partial<Vocabulary>
) => {
  const success = await api.updateVocabulary(vocabularyPatch);

  if (success) {
    const { mutate } = getVocabulariesResource()[1];
    mutate(vs =>
      vs!.map(v =>
        v.id === vocabularyPatch.id ? { ...v, ...vocabularyPatch } : v
      )
    );
  }

  return success;
};

export const createVocabularyItems = async (
  vocabularyId: number,
  ...items: VocabularyItemToCreate[]
) => {
  const itemsToCreate = items.map(i => ({ ...i, list_id: vocabularyId }));
  const createdItems = await api.createVocabularyItems(itemsToCreate);
  const [_, { mutate }] = getVocabulariesResource();

  if (createdItems == null) {
    return false;
  }

  mutate(vs =>
    vs!.map(v => {
      if (v.id !== vocabularyId) {
        return v;
      }
      return {
        ...v,
        vocabularyItems: [...v.vocabularyItems, ...createdItems],
      };
    })
  );

  return true;
};

export const updateVocabularyItems = async (
  vocabularyId: number,
  ...items: VocabularyItem[]
) => {
  const itemsToUpdate = items.map(i => ({ ...i, list_id: vocabularyId }));
  const result = await api.updateVocabularyItems(itemsToUpdate);
  const [_, { mutate }] = getVocabulariesResource();

  if (!result) {
    return false;
  }

  const updatedItemsMap = new Map(itemsToUpdate.map(i => [i.id, i]));

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
