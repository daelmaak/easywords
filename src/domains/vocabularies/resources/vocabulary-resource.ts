import type { QueryClient } from '@tanstack/solid-query';
import type { RealOmit } from '../../../util/object';
import type { Vocabulary, Word } from '../model/vocabulary-model';
import type {
  VocabularyApi,
  WordDB,
  WordToCreateDB,
  VocabularyToCreateDB,
} from './vocabulary-api';
import {
  transformToVocabulary,
  transformToWord,
  transformToWordDB,
} from './vocabulary-transform';
import { VOCABULARIES_QUERY_KEY } from './vocabularies-resource';
import type { WordTranslation } from '~/model/word-translation';

export type WordToCreate = Pick<
  Word,
  'original' | 'translation' | 'vocabularyId'
> &
  Partial<Pick<Word, 'notes'>>;

export type VocabularyToCreate = Pick<Vocabulary, 'country' | 'name'> & {
  words: WordToCreate[];
};

export const VOCABULARY_QUERY_KEY = 'vocabulary';

let api: VocabularyApi;
let queryClient: QueryClient;

export const initVocabularyResource = (
  apis: {
    vocabularyApi: VocabularyApi;
  },
  qClient: QueryClient
) => {
  ({ vocabularyApi: api } = apis);
  queryClient = qClient;
};

export const fetchVocabulary = async (id: number) => {
  const vocabulary = await api.fetchVocabulary(id);

  if (vocabulary == null) {
    return;
  }

  return transformToVocabulary(vocabulary);
};

export const createVocabulary = async (vocabulary: VocabularyToCreate) => {
  const vocabularyDB = transformToVocabularyCreateDB(vocabulary);
  const success = await api.createVocabulary(vocabularyDB);

  if (success) {
    await queryClient.refetchQueries({ queryKey: [VOCABULARIES_QUERY_KEY] });
  }
  return success;
};

export const updateVocabulary = async (
  vocabularyPatch: Partial<RealOmit<Vocabulary, 'words'>> &
    Pick<Vocabulary, 'id'>
) => {
  await api.updateVocabulary(vocabularyPatch);

  queryClient.setQueryData<Vocabulary>(
    [VOCABULARY_QUERY_KEY, vocabularyPatch.id],
    v => ({ ...v!, ...vocabularyPatch })
  );
  await queryClient.invalidateQueries({
    queryKey: [VOCABULARIES_QUERY_KEY],
  });
};

export const deleteVocabulary = async (id: number) => {
  const success = await api.deleteVocabulary(id);

  if (success) {
    void queryClient.invalidateQueries({
      queryKey: [VOCABULARIES_QUERY_KEY],
    });
  }

  return success;
};

export const updateVocabularyAsInteractedWith = async (
  vocabularyId: number
) => {
  await api.updateVocabulary({ id: vocabularyId });
  await queryClient.invalidateQueries({
    queryKey: [VOCABULARIES_QUERY_KEY],
  });
};

export const createWords = async (
  vocabularyId: number,
  ...items: WordTranslation[]
) => {
  const itemsToCreate = items.map(i =>
    transformToWordCreateDB({ ...i, vocabularyId })
  );
  const createdItemsDB = await api.createWords(itemsToCreate);

  queryClient.setQueryData<Vocabulary>(
    [VOCABULARY_QUERY_KEY, vocabularyId],
    v => ({
      ...v!,
      words: v!.words.concat((createdItemsDB ?? []).map(transformToWord)),
    })
  );
};

export const deleteWords = async (vocabularyId: number, ...ids: number[]) => {
  const success = await api.deleteWords(...ids);

  if (success) {
    queryClient.setQueryData<Vocabulary>(
      [VOCABULARY_QUERY_KEY, vocabularyId],
      v => ({
        ...v!,
        words: v!.words.filter(i => !ids.includes(i.id)),
      })
    );
  }

  return success;
};

export const updateWords = async (...items: Word[]) => {
  const itemsDB = items.map(transformToWordDB);
  const result = await api.updateWords(itemsDB);

  if (!result) {
    return false;
  }

  const updatedItemsMap = new Map(items.map(i => [i.id, i]));

  queryClient.setQueryData<Vocabulary>(
    [VOCABULARY_QUERY_KEY, items[0].vocabularyId],
    v => ({
      ...v!,
      words: v!.words.map(i => updatedItemsMap.get(i.id) ?? i),
    })
  );

  return true;
};

const transformToWordCreateDB = (
  word: WordToCreate
): WordToCreateDB & Pick<WordDB, 'vocabulary_id'> => ({
  vocabulary_id: word.vocabularyId,
  original: word.original,
  translation: word.translation,
  notes: word.notes,
});

const transformToVocabularyCreateDB = (
  vocabulary: VocabularyToCreate
): VocabularyToCreateDB => ({
  country: vocabulary.country,
  name: vocabulary.name,
  words: vocabulary.words.map(vi => ({
    original: vi.original,
    translation: vi.translation,
    notes: vi.notes,
  })),
});
