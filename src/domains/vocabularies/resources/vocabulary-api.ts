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

const VOCABULARY_ITEM_FETCH_FIELDS = `
  id,
  list_id,
  original,
  translation,
  notes
`;

const VOCABULARY_FETCH_FIELDS = `
  id, 
  country,
  name,
  vocabulary_items (${VOCABULARY_ITEM_FETCH_FIELDS})
`;

const fetchVocabulary = async (id: number) => {
  const result = await supabase
    .from('vocabularies')
    .select(VOCABULARY_FETCH_FIELDS)
    .eq('id', id);

  const vocabulary = result.data?.[0];

  if (!vocabulary) {
    return undefined;
  }

  return transformVocabulary(vocabulary);
};

const fetchVocabularies = async () => {
  const result = await supabase
    .from('vocabularies')
    .select(VOCABULARY_FETCH_FIELDS);

  const vocabularies = (result.data ?? []).map(transformVocabulary);

  // TODO: This is only temporary and should be ultimately saved in DB
  for (const vocabulary of vocabularies) {
    const progress = await fetchVocabularyProgress(vocabulary.id);
    vocabulary.hasSavedProgress = Boolean(progress);
  }

  return vocabularies;
};

const fetchRecentVocabularies = async (count: number) => {
  const result = await supabase
    .from('vocabularies')
    .select(VOCABULARY_FETCH_FIELDS)
    .order('updated_at', { ascending: false })
    .range(0, count - 1);

  return (result.data ?? []).map(transformVocabulary);
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

const deleteVocabularyList = async (id: number) => {
  const result = await supabase.from('vocabularies').delete().match({ id });

  return !result.error;
};

const updateVocabulary = async (vocabulary: Partial<Vocabulary>) => {
  const result = await supabase
    .from('vocabularies')
    .update({
      ...(omit(vocabulary, 'id', 'vocabularyItems') as Partial<Vocabulary>),
      updated_at: new Date(),
    })
    .eq('id', vocabulary.id);

  return !result.error;
};

const updateVocabularyItems = async (items: VocabularyItem[]) => {
  const result = await supabase.from('vocabulary_items').upsert(items);
  const vocabularyId = items[0].list_id;

  void updateVocabularyUpdatedAt(vocabularyId);

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
  fetchRecentVocabularies,
  updateVocabulary,
  updateVocabularyItems,
};

export type VocabularyApi = typeof vocabularyApi;

const updateVocabularyUpdatedAt = async (id: number) => {
  await supabase
    .from('vocabularies')
    .update({ updated_at: new Date() })
    .eq('id', id);
};

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
