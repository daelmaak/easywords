import type { ResourceReturn, Signal } from 'solid-js';
import { createResource, createSignal } from 'solid-js';
import type { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import type {
  VocabularyApi,
  VocabularyItemDB,
  VocabularyItemToCreateDB,
} from './vocabulary-api';
import {
  transformToVocabulary,
  transformToVocabularyItem,
  transformToVocabularyItemDB,
} from './vocabulary-transform';
import type { RealOmit } from '../../../util/object';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import { fetchVocabularyProgress } from './vocabulary-progress-api';

export type VocabularyItemToCreate = RealOmit<
  VocabularyItem,
  'id' | 'createdAt'
>;

let api: VocabularyApi;
let vocabularyResource: ResourceReturn<Vocabulary | undefined>;
let vocabularyIdSignal: Signal<number | undefined>;

export const initVocabularyResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
  vocabularyIdSignal = createSignal<number>();
  vocabularyResource = createResource(vocabularyIdSignal[0], fetchVocabulary);
};

export const getVocabularyResource = (id: number) => {
  vocabularyIdSignal[1](id);
  return vocabularyResource[0];
};

export const resetVocabularyResource = () => {
  vocabularyIdSignal[1]();
};

export const fetchVocabulary = async (id: number) =>
  api.fetchVocabulary(id).then(async v => {
    if (v == null) {
      return;
    }
    const progress = await fetchVocabularyProgress(id);
    const vocabulary = transformToVocabulary(v);

    if (progress != null) {
      vocabulary.hasSavedProgress = true;
    }
    return vocabulary;
  });

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

export const saveVocabularyProgress = async (
  testResult: RealOmit<TestResult, 'updatedAt'>
) => {
  await saveVocabularyProgress(testResult);

  const { mutate } = vocabularyResource[1];
  mutate(v => ({
    ...v!,
    hasSavedProgress: true,
  }));
};

const transformToVocabularyItemCreateDB = (
  item: VocabularyItemToCreate
): VocabularyItemToCreateDB & Pick<VocabularyItemDB, 'list_id'> => ({
  list_id: item.vocabularyId,
  original: item.original,
  translation: item.translation,
  notes: item.notes,
});
