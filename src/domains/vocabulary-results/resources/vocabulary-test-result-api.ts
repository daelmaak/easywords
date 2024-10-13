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
      vocabulary_test_result_words (
        word_id,
        created_at,
        result,
        attempts,
        status
      )
      `
  );

async function fetchLastTestResult(
  vocabularyId: number
): Promise<TestResultDB | undefined> {
  const result = await testResultsQuery()
    .eq('vocabulary_id', vocabularyId)
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (!result.data) {
    return undefined;
  }

  return {
    ...omit(result.data, 'vocabulary_test_result_words'),
    words: result.data?.vocabulary_test_result_words,
  };
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

  await supabase.from('vocabulary_test_result_words').upsert(
    testResult.words.map(w => ({
      ...w,
      results_id: result.data.id,
      word_id: w.word_id,
    }))
  );

  return {
    ...testResult,
    id: result.data.id,
  };
}

export const vocabularyTestResultApi = {
  fetchLastTestResult,
  saveTestResult,
};

export type VocabularyTestResultApi = typeof vocabularyTestResultApi;
