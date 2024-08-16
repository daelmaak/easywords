import type { QueryClient } from '@tanstack/solid-query';
import type { TestResult } from '~/domains/vocabulary-results/model/test-result-model';
import type { RealOmit } from '../../../util/object';
import type { Vocabulary, Word } from '../model/vocabulary-model';
import type {
  VocabularyApi,
  WordDB,
  WordToCreateDB,
  VocabularyToCreateDB,
} from './vocabulary-api';
import type { VocabularyProgressApi } from './vocabulary-progress-api';
import {
  transformToVocabulary,
  transformToWord,
  transformToWordDB,
} from './vocabulary-transform';
import { VOCABULARIES_QUERY_KEY } from './vocabularies-resource';

export type WordToCreate = RealOmit<Word, 'id' | 'createdAt'>;

export type VocabularyToCreate = RealOmit<
  Vocabulary,
  'id' | 'savedProgress' | 'updatedAt' | 'words'
> & { words: WordToCreate[] };

export const VOCABULARY_QUERY_KEY = 'vocabulary';

let api: VocabularyApi;
let progressApi: VocabularyProgressApi;
let queryClient: QueryClient;

export const initVocabularyResource = (
  apis: {
    vocabularyApi: VocabularyApi;
    vocabularyProgressApi: VocabularyProgressApi;
  },
  qClient: QueryClient
) => {
  ({ vocabularyApi: api, vocabularyProgressApi: progressApi } = apis);
  queryClient = qClient;
};

export const fetchVocabulary = async (id: number) =>
  api.fetchVocabulary(id).then(async v => {
    if (v == null) {
      return;
    }
    const progress = await progressApi.fetchVocabularyProgress(id);
    const vocabulary = transformToVocabulary(v);

    vocabulary.savedProgress = progress;

    return vocabulary;
  });

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
    queryClient.setQueryData<Vocabulary[]>([VOCABULARIES_QUERY_KEY], l =>
      l!.filter(list => list.id !== id)
    );
    await queryClient.invalidateQueries({
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
  ...items: WordToCreate[]
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

export const saveVocabularyProgress = async (
  testResult: RealOmit<TestResult, 'updatedAt'>
) => {
  await progressApi.saveVocabularyProgress(testResult);

  queryClient.setQueryData<Vocabulary>(
    [VOCABULARY_QUERY_KEY, testResult.vocabularyId],
    v => ({
      ...v!,
      savedProgress: { ...testResult, updatedAt: new Date() },
    })
  );
};

export const deleteVocabularyProgress = async (vocabularyId: number) => {
  await progressApi.deleteVocabularyProgress(vocabularyId);

  queryClient.setQueryData<Vocabulary>(
    [VOCABULARY_QUERY_KEY, vocabularyId],
    v => ({
      ...v!,
      savedProgress: undefined,
    })
  );
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
