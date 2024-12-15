import { supabase } from '~/lib/supabase-client';
import type { Database } from '~/lib/database.types';
import { omit } from '~/util/object';

type DBTestResults = Database['public']['Tables']['vocabulary_test_results'];

type DBTestResultWords =
  Database['public']['Tables']['vocabulary_test_result_words'];

export type TestResultDB = DBTestResults['Row'] & {
  words: TestResultWordDB[];
};

export type TestResultWordDB = Omit<DBTestResultWords['Row'], 'results_id'>;

export type TestResultToCreateDB = DBTestResults['Insert'] & {
  words: Omit<TestResultWordToCreateDB, 'results_id'>[];
};

export type TestResultWordToCreateDB = DBTestResultWords['Insert'];

const testResultsQuery = () =>
  supabase.from('vocabulary_test_results').select(
    `
      id,
      vocabulary_id,
      created_at,
      updated_at,
      done,
      words: vocabulary_test_result_words (
        word_id,
        created_at,
        done,
        result,
        attempts
      )
      `
  );

async function fetchLastTestResult(
  vocabularyId: number,
  options?: { done: boolean }
): Promise<TestResultDB | null> {
  let query = testResultsQuery().eq('vocabulary_id', vocabularyId);

  if (options) {
    query = query.eq('done', options.done);
  }

  const result = await query
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return result.data;
}

export type PreviousWordResultDB =
  Database['public']['Functions']['get_previous_word_results']['Returns'][number];

/**
 * Fetches for each word ID the one before the last result, if there is any.
 */
async function fetchPreviousWordResults(
  testResultId: number
): Promise<PreviousWordResultDB[] | null> {
  const { data } = await supabase.rpc('get_previous_word_results', {
    base_test_result_id: testResultId,
  });

  return data;
}

async function fetchWordResults(
  wordId: number,
  options: { upToDaysAgo: number }
) {
  const result = await supabase
    .from('vocabulary_test_result_words')
    .select('*')
    .eq('word_id', wordId)
    .gte(
      'created_at',
      new Date(
        Date.now() - options.upToDaysAgo * 24 * 60 * 60 * 1000
      ).toISOString()
    );

  return result.data ?? undefined;
}

async function fetchTestResult(testId: number) {
  const result = await supabase
    .from('vocabulary_test_results')
    .select(
      `
        *,
        words: vocabulary_test_result_words (
          *
        )
     `
    )
    .eq('id', testId)
    .single();

  return result.data;
}

async function fetchTestResults(
  vocabularyId: number,
  options: { upToDaysAgo: number }
) {
  const result = await supabase
    .from('vocabulary_test_results')
    .select(
      `
        *,
        words: vocabulary_test_result_words (
          *
        )
      `
    )
    .eq('vocabulary_id', vocabularyId)
    .eq('done', true)
    .eq('words.done', true)
    .gte(
      'created_at',
      new Date(
        Date.now() - options.upToDaysAgo * 24 * 60 * 60 * 1000
      ).toISOString()
    );

  return result.data ?? [];
}

async function hasTestProgress(vocabularyId: number) {
  const result = await supabase
    .from('vocabulary_test_results')
    .select('id')
    .eq('vocabulary_id', vocabularyId)
    .eq('done', false)
    .order('updated_at', { ascending: false })
    .maybeSingle();

  return Boolean(result.data);
}

async function saveTestResult(testResult: TestResultToCreateDB) {
  const result = await supabase
    .from('vocabulary_test_results')
    .upsert({
      ...omit(testResult, 'words'),
      updated_at: new Date(),
    })
    .select('id')
    .single();

  if (!result.data) {
    throw new Error('Results not saved');
  }

  if (testResult.words.length > 0) {
    await supabase.from('vocabulary_test_result_words').upsert(
      testResult.words.map(w => ({
        ...w,
        results_id: result.data.id,
        word_id: w.word_id,
      }))
    );
  }

  return {
    ...testResult,
    id: result.data.id,
  };
}

export const vocabularyTestResultApi = {
  fetchTestResult,
  fetchTestResults,
  fetchWordResults,
  fetchLastTestResult,
  fetchPreviousWordResults,
  hasTestProgress,
  saveTestResult,
};

export type VocabularyTestResultApi = typeof vocabularyTestResultApi;
