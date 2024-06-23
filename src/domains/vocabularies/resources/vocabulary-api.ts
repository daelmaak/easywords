import { supabase } from '~/lib/supabase-client';
import { RealOmit, omit } from '~/util/object';
import { VocabularyItem, Vocabulary } from '../model/vocabulary-model';
import { fetchVocabularyProgress } from './vocabulary-progress-api';
import { CountryCode } from '~/components/country-select/countries';

export type VocabularyItemToCreate = RealOmit<VocabularyItem, 'id' | 'list_id'>;
export type VocabularyToCreate = RealOmit<
  Vocabulary,
  'id' | 'vocabularyItems' | 'hasSavedProgress'
> & {
  vocabularyItems: VocabularyItemToCreate[];
};

const fetchVocabulary = async (id: number) => {
  const result = await supabase
    .from('vocabularies')
    .select(
      `
    id, 
    country,
    name,
    vocabulary_items (
      id,
      list_id,
      original,
      translation
    )`
    )
    .eq('id', id);

  const vocabulary = result.data?.[0];

  if (!vocabulary) {
    return undefined;
  }

  return transformVocabulary(vocabulary);
};

const fetchVocabularies = async () => {
  const result = await supabase.from('vocabularies').select(
    `
    id, 
    country,
    name,
    vocabulary_items (
      id,
      list_id,
      original,
      translation
    )`
  );

  const vocabularies = (result.data ?? []).map(transformVocabulary);

  // TODO: This is only temporary and should be ultimately saved in DB
  for (const vocabulary of vocabularies) {
    const progress = await fetchVocabularyProgress(vocabulary.id);
    vocabulary.hasSavedProgress = Boolean(progress);
  }

  return vocabularies;
};

const createVocabularyList = async (vocabulary: VocabularyToCreate) => {
  const listResult = await supabase
    .from('vocabularies')
    .insert({ ...omit(vocabulary, 'vocabularyItems') })
    .select();

  if (listResult.error) {
    return false;
  }

  const createdList = listResult.data?.[0];

  const attachedWords = vocabulary.vocabularyItems.map(word => ({
    ...word,
    list_id: createdList?.id,
  }));

  const itemsResult = await supabase
    .from('vocabulary_items')
    .insert(attachedWords);

  return !itemsResult.error;
};

const createVocabularyItems = async (items: VocabularyItemToCreate[]) => {
  const result = await supabase.from('vocabulary_items').insert(items).select(`
    id,
    list_id,
    original,
    translation
  `);

  return result.data;
};

const deleteVocabularyList = async (id: number) => {
  const result = await supabase.from('vocabularies').delete().match({ id });

  return !result.error;
};

const updateVocabulary = async (vocabulary: Partial<Vocabulary>) => {
  const result = await supabase
    .from('vocabularies')
    .update(omit(vocabulary, 'id', 'vocabularyItems') as Partial<Vocabulary>)
    .eq('id', vocabulary.id);

  return !result.error;
};

const updateVocabularyItems = async (items: VocabularyItem[]) => {
  const result = await supabase.from('vocabulary_items').upsert(items);
  return !result.error;
};

const deleteVocabularyItems = async (...ids: number[]) => {
  const result = await supabase.from('vocabulary_items').delete().in('id', ids);
  return !result.error;
};

export const vocabularyApi = {
  createVocabularyItems,
  createVocabularyList,
  deleteVocabularyItems,
  deleteVocabularyList,
  fetchVocabulary,
  fetchVocabularies,
  updateVocabulary,
  updateVocabularyItems,
};

export type VocabularyApi = typeof vocabularyApi;

// Move to resource
const transformVocabulary = (vocabulary: {
  id: number;
  country: string;
  name: string;
  vocabulary_items: VocabularyItem[];
}): Vocabulary => ({
  id: vocabulary.id,
  country: vocabulary.country as CountryCode,
  hasSavedProgress: false,
  name: vocabulary.name,
  vocabularyItems: vocabulary.vocabulary_items,
});
