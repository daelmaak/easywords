import { supabase } from '~/lib/supabase-client';
import { WordTranslation } from '~/model/word-translation';
import { VocabularyItem } from '../vocabulary-model';

const fetchVocabularyLists = async () => {
  const result = await supabase.from('vocabulary_lists').select(
    `
    id, 
    name,
    vocabulary_items (
      id,
      list_id,
      original,
      translation
    )`
  );

  return (result.data ?? []).map(lists => ({
    id: lists.id,
    name: lists.name,
    vocabularyItems: lists.vocabulary_items,
  }));
};

const createVocabularyList = async (name: string, words: WordTranslation[]) => {
  const listResult = await supabase
    .from('vocabulary_lists')
    .insert({
      name,
    })
    .select();

  if (listResult.error) {
    return false;
  }

  const createdList = listResult.data?.[0];

  const attachedWords = words.map(word => ({
    ...word,
    list_id: createdList?.id,
  }));

  const itemsResult = await supabase
    .from('vocabulary_items')
    .insert(attachedWords);

  return !itemsResult.error;
};

const deleteVocabularyList = async (id: number) => {
  const result = await supabase.from('vocabulary_lists').delete().match({ id });

  return !result.error;
};

const updateVocabularyItems = async (items: VocabularyItem[]) => {
  const result = await supabase.from('vocabulary_items').upsert(items);

  return !result.error;
};

export const vocabularyApi = {
  fetchVocabularyLists,
  createVocabularyList,
  deleteVocabularyList,
  updateVocabularyItem: updateVocabularyItems,
};

export type VocabularyApi = typeof vocabularyApi;
