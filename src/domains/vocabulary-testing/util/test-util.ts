import type {
  VocabularyDB,
  WordDB,
} from '~/domains/vocabularies/resources/vocabulary-api';
import type {
  TestResult,
  TestResultWord,
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
    })
  );

  return {
    id: 1,
    name: 'Vocabulary title',
    country: 'cz',
    words: words,
    updated_at: new Date(),
  };
}

export function createMockTestProgress(
  vocabulary: VocabularyDB,
  {
    correct = 0,
    incorrect = 0,
    skipped = 0,
    totalPartial,
  }: {
    correct?: number;
    incorrect?: number;
    skipped?: number;
    totalPartial?: number;
  }
) {
  const testResult: TestResult = {
    vocabularyId: vocabulary.id,
    done: false,
    updatedAt: new Date(),
    words: [],
  };

  const totalWordResultsToAffect =
    totalPartial ?? correct + incorrect + skipped;

  for (let i = 0; i < totalWordResultsToAffect; i++) {
    const testResultWord: TestResultWord = {
      id: vocabulary.words[i].id,
      done: false,
      invalidAttempts: 0,
      skipped: false,
    };

    if (correct > 0) {
      testResultWord.done = true;
      correct--;
    } else if (incorrect > 0) {
      testResultWord.done = true;
      testResultWord.invalidAttempts = 1;
      incorrect--;
    } else if (skipped > 0) {
      testResultWord.skipped = true;
      skipped--;
    }
    testResult.words.push(testResultWord);
  }

  return testResult;
}
