import { supabase } from '~/lib/supabase-client';
import type { RealOmit } from '~/util/object';
import { omit } from '~/util/object';
import type { QueryData } from '@supabase/supabase-js';

export type VocabularyItemToCreateDB = RealOmit<
  VocabularyItemDB,
  'id' | 'created_at' | 'list_id'
>;

export type VocabularyToCreateDB = RealOmit<
  VocabularyDB,
  'id' | 'updated_at' | 'vocabulary_items'
> & {
  vocabulary_items: VocabularyItemToCreateDB[];
};

const VOCABULARY_ITEM_FETCH_FIELDS = `
  id,
  created_at,
  list_id,
  original,
  translation,
  notes
`;

const VOCABULARY_FETCH_FIELDS = `
  id,
  country,
  name,
  updated_at,
  vocabulary_items (${VOCABULARY_ITEM_FETCH_FIELDS})
`;

const vocabulariesFetchQuery = () =>
  supabase.from('vocabularies').select(VOCABULARY_FETCH_FIELDS);

export type VocabularyDB = QueryData<
  ReturnType<typeof vocabulariesFetchQuery>
>[number];

export interface VocabularyItemDB {
  id: number;
  created_at: string;
  list_id: number;
  original: string;
  translation: string;
  notes: string | undefined;
}

const fetchVocabulary = async (id: number) => {
  const result = await vocabulariesFetchQuery().eq('id', id);
  return result.data?.[0];
};

const fetchVocabularies = async () => {
  const result = await vocabulariesFetchQuery();
  const vocabularies = result.data;

  if (vocabularies == null) {
    return;
  }

  return vocabularies;
};

const fetchRecentVocabularies = async (count: number) => {
  const result = await vocabulariesFetchQuery()
    .order('updated_at', { ascending: false })
    .range(0, count - 1);

  return result.data;
};

const createVocabulary = async (vocabulary: VocabularyToCreateDB) => {
  const listResult = await supabase
    .from('vocabularies')
    .insert({ ...omit(vocabulary, 'vocabulary_items') })
    .select();

  if (listResult.error) {
    return false;
  }

  const createdList = listResult.data?.[0];

  const attachedWords = vocabulary.vocabulary_items.map(word => ({
    ...word,
    list_id: createdList?.id,
  }));

  const itemsResult = await supabase
    .from('vocabulary_items')
    .insert(attachedWords);

  return !itemsResult.error;
};

const createVocabularyItems = async (items: VocabularyItemToCreateDB[]) => {
  const result = await supabase
    .from('vocabulary_items')
    .insert(items)
    .select(VOCABULARY_ITEM_FETCH_FIELDS);

  if (result.data) {
    const vocabularyId = result.data[0].list_id;
    void updateVocabularyUpdatedAt(vocabularyId);
  }

  return result.data;
};

const deleteVocabulary = async (id: number) => {
  const result = await supabase.from('vocabularies').delete().match({ id });
  return !result.error;
};

const updateVocabulary = async (
  vocabulary: Partial<VocabularyDB> & Pick<VocabularyDB, 'id'>
) => {
  const result = await supabase
    .from('vocabularies')
    .update({
      ...omit(vocabulary, 'id'),
      updated_at: new Date(),
    })
    .eq('id', vocabulary.id);
  return !result.error;
};

const updateVocabularyItems = async (
  items: RealOmit<VocabularyItemDB, 'created_at'>[]
) => {
  const result = await supabase.from('vocabulary_items').upsert(items);
  const vocabularyId = items[0].list_id;

  void updateVocabularyUpdatedAt(vocabularyId);

  return !result.error;
};

const deleteVocabularyItems = async (...ids: number[]) => {
  const result = await supabase.from('vocabulary_items').delete().in('id', ids);
  return !result.error;
};

const updateVocabularyUpdatedAt = async (id: number) => {
  await supabase
    .from('vocabularies')
    .update({ updated_at: new Date() })
    .eq('id', id);
};

export const vocabularyApi = {
  createVocabularyItems,
  createVocabulary,
  deleteVocabularyItems,
  deleteVocabulary,
  fetchVocabulary,
  fetchVocabularies,
  fetchRecentVocabularies,
  updateVocabulary,
  updateVocabularyItems,
};

export type VocabularyApi = typeof vocabularyApi;
