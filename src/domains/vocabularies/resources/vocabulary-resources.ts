import { ResourceReturn, createResource } from 'solid-js';
import {
  fetchVocabularyLists,
  updateVocabularyItem as updateVocabularyItemApi,
} from './vocabulary-api';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';

export const vocabulariesResource: ResourceReturn<VocabularyList[]> =
  createResource(fetchVocabularyLists);

export const vocabularyResource = (id: number) => {
  const [vocabularies] = vocabulariesResource;
  return vocabularies()?.find(v => v.id === id);
};

export const updateVocabularyItem = async (
  vocabularyId: number,
  item: VocabularyItem
) => {
  const result = await updateVocabularyItemApi(item);
  const [_, { mutate }] = vocabulariesResource;

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
