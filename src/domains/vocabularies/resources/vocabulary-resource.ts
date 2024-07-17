import type { ResourceReturn, Setter } from 'solid-js';
import { createResource, createSignal } from 'solid-js';
import type { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import type { VocabularyApi, VocabularyItemToCreateDB } from './vocabulary-api';
import {
  transformToVocabulary,
  transformToVocabularyItem,
  transformToVocabularyItemDB,
} from './vocabulary-transform';
import type { RealOmit } from '../../../util/object';

export type VocabularyItemToCreate = RealOmit<
  VocabularyItem,
  'id' | 'createdAt'
>;

let api: VocabularyApi;
let vocabularyResource: ResourceReturn<Vocabulary | undefined>;
let setVocabularyId: Setter<number | undefined>;

export const initVocabularyResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;

  const [vocabularyId, _setVocabularyId] = createSignal<number>();
  setVocabularyId = _setVocabularyId;
  vocabularyResource = createResource(vocabularyId, id =>
    api.fetchVocabulary(id).then(v => v && transformToVocabulary(v))
  );
};

export const getVocabulary = (id: number) => {
  setVocabularyId(id);
  return vocabularyResource[0];
};

export const updateVocabulary = async (
  vocabularyPatch: Partial<Vocabulary>,
  config: { mutate: boolean } = { mutate: true }
) => {
  const success = await api.updateVocabulary(vocabularyPatch);

  if (config?.mutate && success) {
    const { mutate } = vocabularyResource[1];
    mutate(v => ({ ...v!, ...vocabularyPatch }));
  }

  return success;
};

export const updateVocabularyAsInteractedWith = async (
  vocabularyId: number
) => {
  // Mutating this resource doesn't make sense, since this is relevant only to
  // dashboard and its resource is elsewhere.
  return await updateVocabulary({ id: vocabularyId }, { mutate: false });
};

export const createVocabularyItems = async (
  vocabularyId: number,
  ...items: VocabularyItemToCreate[]
) => {
  const itemsToCreate = items.map(i =>
    transformToVocabularyItemCreateDB({ ...i, vocabularyId })
  );
  const createdItemsDB = await api.createVocabularyItems(itemsToCreate);

  if (createdItemsDB == null) {
    return false;
  }

  const createdItems = createdItemsDB.map(transformToVocabularyItem);
  const { mutate } = vocabularyResource[1];

  mutate(v => ({
    ...v!,
    vocabularyItems: v!.vocabularyItems.concat(createdItems),
  }));

  return true;
};

export const deleteVocabularyItems = async (...ids: number[]) => {
  const success = await api.deleteVocabularyItems(...ids);

  if (success) {
    const { mutate } = vocabularyResource[1];
    mutate(v => ({
      ...v!,
      vocabularyItems: v!.vocabularyItems.filter(i => !ids.includes(i.id)),
    }));
  }

  return success;
};

export const updateVocabularyItems = async (...items: VocabularyItem[]) => {
  const itemsDB = items.map(transformToVocabularyItemDB);
  const result = await api.updateVocabularyItems(itemsDB);

  if (!result) {
    return false;
  }

  const { mutate } = vocabularyResource[1];
  const updatedItemsMap = new Map(items.map(i => [i.id, i]));

  mutate(v => ({
    ...v!,
    vocabularyItems: v!.vocabularyItems.map(
      i => updatedItemsMap.get(i.id) ?? i
    ),
  }));

  return true;
};

const transformToVocabularyItemCreateDB = (
  item: VocabularyItemToCreate
): VocabularyItemToCreateDB => ({
  list_id: item.vocabularyId,
  original: item.original,
  translation: item.translation,
  notes: item.notes,
});
