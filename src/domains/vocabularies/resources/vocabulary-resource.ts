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
import type { VocabularyTestResultApi } from '~/domains/vocabulary-results/resources/vocabulary-test-result-api';
import type { TestResultWord } from '~/domains/vocabulary-results/model/test-result-model';

export type WordToCreate = RealOmit<
  Word,
  'id' | 'createdAt' | 'notes' | 'results' | 'latestTestDate' | 'oldestTestDate'
> &
  Partial<Pick<Word, 'notes'>>;

export type VocabularyToCreate = RealOmit<
  Vocabulary,
  'id' | 'savedProgress' | 'updatedAt' | 'words' | 'testInProgress'
> & { words: WordToCreate[] };

export const VOCABULARY_QUERY_KEY = 'vocabulary';

let api: VocabularyApi;
let testResultApi: VocabularyTestResultApi;
let queryClient: QueryClient;

export const initVocabularyResource = (
  apis: {
    vocabularyApi: VocabularyApi;
    testResultApi: VocabularyTestResultApi;
  },
  qClient: QueryClient
) => {
  ({ vocabularyApi: api, testResultApi } = apis);
  queryClient = qClient;
};

export const fetchVocabulary = async (id: number) => {
  const vocabulary = await api.fetchVocabulary(id);

  if (vocabulary == null) {
    return;
  }

  return transformToVocabulary(vocabulary);
};

export const fetchVocabularyWithResults = async (id: number) => {
  const [vocabulary, testResults] = await Promise.all([
    fetchVocabulary(id),
    testResultApi.fetchTestResults(id, { upToDaysAgo: 30 }),
  ]);

  if (vocabulary == null) {
    return;
  }

  let testResultsWordsDict: Record<number, TestResultWord[]> = {};

  if (testResults.length > 1) {
    testResultsWordsDict = testResults
      .toSorted(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .flatMap(tr => tr.words)
      .reduce(
        (acc, wordResult) => {
          if (acc[wordResult.word_id] == null) {
            acc[wordResult.word_id] = [];
          }
          acc[wordResult.word_id].push(wordResult);
          return acc;
        },
        {} as Record<number, TestResultWord[]>
      );
  }

  return {
    ...vocabulary,
    words: vocabulary.words.map(w =>
      testResultsWordsDict[w.id] == null
        ? w
        : {
            ...w,
            results: testResultsWordsDict[w.id],
            latestTestDate: new Date(testResultsWordsDict[w.id][0].created_at),
            oldestTestDate: new Date(
              testResultsWordsDict[w.id].at(-1)!.created_at
            ),
          }
    ),
  };
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
