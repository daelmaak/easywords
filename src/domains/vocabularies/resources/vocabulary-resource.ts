import { ResourceReturn, Setter, createResource, createSignal } from 'solid-js';
import { Vocabulary, VocabularyItem } from '../model/vocabulary-model';
import { VocabularyApi, VocabularyItemToCreate } from './vocabulary-api';

let api: VocabularyApi;
let vocabularyResource: ResourceReturn<Vocabulary | undefined>;
let setVocabularyId: Setter<number | undefined>;

export const initVocabularyResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;

  const [vocabularyId, _setVocabularyId] = createSignal<number>();
  setVocabularyId = _setVocabularyId;
  vocabularyResource = createResource(vocabularyId, api.fetchVocabulary);
};

export const getVocabulary = (id: number) => {
  setVocabularyId(id);
  return vocabularyResource[0];
};

export const updateVocabulary = async (
  vocabularyPatch: Partial<Vocabulary>
) => {
  const success = await api.updateVocabulary(vocabularyPatch);

  if (success) {
    const { mutate } = vocabularyResource[1];
    mutate(v => ({ ...v!, ...vocabularyPatch }));
  }

  return success;
};

export const createVocabularyItems = async (
  vocabularyId: number,
  ...items: VocabularyItemToCreate[]
) => {
  const itemsToCreate = items.map(i => ({ ...i, list_id: vocabularyId }));
  const createdItems = await api.createVocabularyItems(itemsToCreate);
  const { mutate } = vocabularyResource[1];

  if (createdItems == null) {
    return false;
  }

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
  const result = await api.updateVocabularyItems(items);

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
