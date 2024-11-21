import type {
  VocabularyDB,
  WordDB,
} from '~/domains/vocabularies/resources/vocabulary-api';
import {
  TestWordStatus,
  type TestResult,
  type TestResultWord,
} from '~/domains/vocabulary-results/model/test-result-model';

export function createMockVocabularyDB(config: {
  wordAmount: number;
}): VocabularyDB {
  const words: WordDB[] = Array.from(
    { length: config.wordAmount },
    (_, index) => ({
      id: index,
      created_at: String(new Date().getTime()),
      vocabulary_id: 1,
      original: `original${index}`,
      translation: `translation${index}`,
      notes: '',
      archived: false,
    })
  );

  return {
    id: 1,
    name: 'Test Vocabulary',
    country: 'cz',
    words,
    updated_at: new Date().toISOString(),
  };
}

export function createMockTestProgress(
  vocabulary: VocabularyDB,
  {
    correct = 0,
    incorrect = 0,
    skipped = 0,
    total,
  }: {
    correct?: number;
    incorrect?: number;
    skipped?: number;
    total?: number;
  }
) {
  const testResult: TestResult = {
    id: 1,
    vocabulary_id: vocabulary.id,
    done: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    words: [],
  };

  const totalWordResultsToAffect = total ?? correct + incorrect + skipped;

  for (let i = 0; i < totalWordResultsToAffect; i++) {
    const testResultWord: TestResultWord = {
      created_at: new Date().toISOString(),
      done: true,
      result: TestWordStatus.NotDone,
      word_id: vocabulary.words[i].id,
    };

    if (correct > 0) {
      testResultWord.result = TestWordStatus.Correct;
      correct--;
    } else if (incorrect > 0) {
      testResultWord.result = TestWordStatus.Wrong;
      testResultWord.attempts = [TestWordStatus.Wrong];
      incorrect--;
    } else if (skipped > 0) {
      skipped--;
    } else {
      testResultWord.done = false;
    }
    testResult.words.push(testResultWord);
  }

  return testResult;
}
