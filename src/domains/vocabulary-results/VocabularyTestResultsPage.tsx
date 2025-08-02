import { createSignal, Show, Suspense, type Component } from 'solid-js';
import { Results } from './components/Results';
import { useNavigate, useParams } from '@solidjs/router';
import {
  deleteWords,
  fetchVocabulary,
  updateWords,
} from '../vocabularies/resources/vocabulary-resource';
import {
  fetchPreviousWordResults,
  fetchTestResult,
} from './resources/vocabulary-test-result-resource';
import type { Word } from '../vocabularies/model/vocabulary-model';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
import { BackLink } from '~/components/BackLink';
import { createQuery } from '@tanstack/solid-query';
import { previousWordResults, testResultKey } from './resources/cache-keys';
import { vocabularyRoute } from '~/routes/routes';
import { Sheet, SheetContent } from '~/components/ui/sheet';
import { WordDetail } from '../vocabularies/components/WordDetail';

export const VocabularyTestResultsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;
  const testId = +params.testId;

  const [wordToShowDetail, setWordToShowDetail] = createSignal<Word>();

  const vocabularyQuery = createQuery(() => ({
    queryKey: ['vocabulary', vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const testResultQuery = createQuery(() => ({
    queryKey: testResultKey(testId),
    queryFn: () => fetchTestResult(testId),
  }));

  const previousWordResultsQuery = createQuery(() => ({
    queryKey: previousWordResults(testId),
    queryFn: () => fetchPreviousWordResults(testId),
  }));

  async function onArchive(words: Word[]) {
    await updateWords(...words.map(w => ({ ...w, archived: true })));
  }

  function onDeleteWord(word: Word) {
    void deleteWords(vocabularyId, word.id);
  }

  function onRepeatAll() {
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: testResultQuery.data!.words.map(w => w.word_id),
    });
  }

  function onRepeat(words: Word[]) {
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: words.map(w => w.id),
    });
  }

  async function onWordsEdited(updatedWord: Word) {
    await updateWords(updatedWord);
  }

  return (
    <main class="page-container min-h-full bg-gray-50">
      <BackLink href={vocabularyRoute(vocabularyId)}>
        Back to vocabulary
      </BackLink>
      <Suspense fallback={<div>Loading...</div>}>
        <h1 class="mb-4 flex items-center justify-center">
          <span class="text-2xl">Test results</span>
          <span class={`fi mx-2 size-4 fi-${vocabularyQuery.data?.country}`} />
          {vocabularyQuery.data?.name}
        </h1>
        <Show when={vocabularyQuery.data}>
          {vocabulary => (
            <>
              <Show when={testResultQuery.data}>
                {results => (
                  <Results
                    results={results()}
                    previousWordResults={
                      previousWordResultsQuery.data ?? undefined
                    }
                    words={vocabulary().words}
                    onWordClick={setWordToShowDetail}
                    onArchive={onArchive}
                    onRepeatAll={onRepeatAll}
                    onRepeat={onRepeat}
                  />
                )}
              </Show>
              <Sheet
                open={wordToShowDetail() != null}
                onOpenChange={() => setWordToShowDetail(undefined)}
              >
                <SheetContent
                  class="w-full p-0 sm:w-auto"
                  onOpenAutoFocus={e => e.preventDefault()}
                >
                  <Show when={wordToShowDetail()}>
                    {word => (
                      <WordDetail
                        word={word()}
                        onWordDelete={() => onDeleteWord(word())}
                        onWordEdited={onWordsEdited}
                        vocabularyLang={vocabulary().country}
                      />
                    )}
                  </Show>
                </SheetContent>
              </Sheet>
            </>
          )}
        </Show>
      </Suspense>
    </main>
  );
};
