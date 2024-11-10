import type { Vocabulary } from '~/domains/vocabularies/model/vocabulary-model';
import type { TestResult, TestResultWord } from '../model/test-result-model';
import { TestWordStatus } from '../model/test-result-model';

export const combineVocabularyWithTestResults = (
  vocabulary?: Vocabulary,
  testResults?: TestResult[]
) => {
  if (vocabulary == null || testResults == null) {
    return vocabulary;
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
            lastTestDate: new Date(testResultsWordsDict[w.id][0].created_at),
            testCount: testResultsWordsDict[w.id].length,
            averageTestScore:
              (testResultsWordsDict[w.id].reduce(
                (acc, curr) =>
                  acc +
                  (TestWordStatus.Wrong - curr.result) /
                    (TestWordStatus.Wrong - 1),
                0
              ) /
                testResultsWordsDict[w.id].length) *
              100,
          }
    ),
  };
};
