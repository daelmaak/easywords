import { supabase } from '~/lib/supabase-client';
import type { RealOmit } from '~/util/object';
import { omit } from '~/util/object';
import type { Database } from '~/lib/database.types';

export type WordToCreateDB = Pick<
  WordDB,
  'original' | 'translation' | 'vocabulary_id'
> &
  Partial<Pick<WordDB, 'notes'>>;

export type VocabularyToCreateDB = Pick<VocabularyDB, 'country' | 'name'> & {
  words: RealOmit<WordToCreateDB, 'vocabulary_id'>[];
};

const WORD_FETCH_FIELDS = `
  id,
  created_at,
  vocabulary_id,
  original,
  translation,
  notes,
  archived
`;

const VOCABULARY_FETCH_FIELDS = `
  id,
  country,
  name,
  updated_at,
  archived,
  words (${WORD_FETCH_FIELDS})
`;

const vocabulariesFetchQuery = () =>
  supabase.from('vocabularies').select(VOCABULARY_FETCH_FIELDS);

export type VocabularyDB = Omit<
  Database['public']['Tables']['vocabularies']['Row'],
  'created_at' | 'user_id'
> & {
  words: WordDB[];
};
export type WordDB = Database['public']['Tables']['words']['Row'];

const fetchVocabulary = async (id: number) => {
  const result = await vocabulariesFetchQuery().eq('id', id);

  return result.data?.[0];
};

const fetchVocabularies = async (includeArchived = false) => {
  const query = supabase.from('vocabularies').select(VOCABULARY_FETCH_FIELDS);

  if (!includeArchived) {
    query.not('archived', 'is', true);
  }

  return (await query).data;
};

const fetchRecentVocabularies = async (count: number) => {
  const result = await vocabulariesFetchQuery()
    .not('words.archived', 'is', true)
    .order('updated_at', { ascending: false })
    .range(0, count - 1);

  return result.data;
};

const createVocabulary = async (vocabulary: VocabularyToCreateDB) => {
  const listResult = await supabase
    .from('vocabularies')
    .insert({ ...omit(vocabulary, 'words') })
    .select();

  if (listResult.error) {
    return false;
  }

  const createdList = listResult.data?.[0];

  const attachedWords = vocabulary.words.map(word => ({
    ...word,
    vocabulary_id: createdList?.id,
  }));

  const itemsResult = await supabase.from('words').insert(attachedWords);

  return !itemsResult.error;
};

const createWords = async (items: WordToCreateDB[]) => {
  const result = await supabase
    .from('words')
    .insert(items)
    .select(WORD_FETCH_FIELDS);

  if (result.data) {
    const vocabularyId = result.data[0].vocabulary_id;
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

const updateWords = async (items: Omit<WordDB, 'created_at'>[]) => {
  const result = await supabase.from('words').upsert(items);
  const vocabularyId = items[0].vocabulary_id;

  void updateVocabularyUpdatedAt(vocabularyId);

  return !result.error;
};

const deleteWords = async (...ids: number[]) => {
  const result = await supabase.from('words').delete().in('id', ids);
  return !result.error;
};

const updateVocabularyUpdatedAt = async (id: number) => {
  await supabase
    .from('vocabularies')
    .update({ updated_at: new Date() })
    .eq('id', id);
};

export const vocabularyApi = {
  createWords,
  createVocabulary,
  deleteWords,
  deleteVocabulary,
  fetchVocabulary,
  fetchVocabularies,
  fetchRecentVocabularies,
  updateVocabulary,
  updateWords,
};

export type VocabularyApi = typeof vocabularyApi;
