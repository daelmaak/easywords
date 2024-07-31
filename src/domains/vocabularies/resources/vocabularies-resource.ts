import type { ResourceReturn, Signal } from 'solid-js';
import { createResource, createSignal } from 'solid-js';
import type { Vocabulary } from '../model/vocabulary-model';
import type {
  VocabularyApi,
  VocabularyDB,
  VocabularyToCreateDB,
} from './vocabulary-api';
import { transformToVocabulary } from './vocabulary-transform';
import { fetchVocabularyProgress } from './vocabulary-progress-api';
import type { RealOmit } from '../../../util/object';
import type { VocabularyItemToCreate } from './vocabulary-resource';

export type VocabularyToCreate = RealOmit<
  Vocabulary,
  'id' | 'hasSavedProgress' | 'updatedAt' | 'vocabularyItems'
> & { vocabularyItems: VocabularyItemToCreate[] };

let api: VocabularyApi;
let vocabulariesSignal: Signal<boolean>;
let vocabulariesResource: ResourceReturn<Vocabulary[] | undefined>;

export const initVocabulariesResource = (vocabularyApi: VocabularyApi) => {
  api = vocabularyApi;
  vocabulariesSignal = createSignal(false);
  vocabulariesResource = createResource(
    vocabulariesSignal[0],
    fetchVocabularies
  );
};

export const getVocabulariesResource = () => {
  vocabulariesSignal[1](true);
  return vocabulariesResource;
};

export const resetVocabulariesResource = () => {
  vocabulariesSignal[1](false);
};

export const fetchVocabularies = async () => {
  const vocabulariesDB = await api.fetchVocabularies();
  return transformToVocabularies(vocabulariesDB ?? []);
};

export const createVocabulary = async (vocabulary: VocabularyToCreate) => {
  const vocabularyDB = transformToVocabularyCreateDB(vocabulary);
  const success = await api.createVocabulary(vocabularyDB);

  if (success) {
    const { refetch } = vocabulariesResource[1];
    await refetch();
  }
  return success;
};

export const deleteVocabulary = async (id: number) => {
  const success = await api.deleteVocabulary(id);

  if (success) {
    const { mutate } = vocabulariesResource[1];
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
  vocabulary_items: vocabulary.vocabularyItems.map(vi => ({
    original: vi.original,
    translation: vi.translation,
    notes: vi.notes,
  })),
});
