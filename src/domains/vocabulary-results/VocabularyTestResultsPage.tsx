import { Show, Suspense, type Component } from 'solid-js';
import { Results } from './components/Results';
import { useNavigate, useParams } from '@solidjs/router';
import {
  fetchVocabulary,
  updateWords,
} from '../vocabularies/resources/vocabulary-resource';
import { fetchLastTestResult } from './resources/vocabulary-test-result-resource';
import type { Word } from '../vocabularies/model/vocabulary-model';
import { navigateToVocabularyTest } from '../vocabularies/util/navigation';
import { BackLink } from '~/components/BackLink';
import { createQuery } from '@tanstack/solid-query';
import { lastTestResultKey } from './resources/cache-keys';

export const VocabularyTestResultsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;

  const vocabularyQuery = createQuery(() => ({
    queryKey: ['vocabulary', vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const lastTestResultQuery = createQuery(() => ({
    queryKey: lastTestResultKey(vocabularyId),
    queryFn: () => fetchLastTestResult(vocabularyId),
  }));

  function onRepeatAll() {
    navigate('..');
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
    <main class="page-container">
      <BackLink href="../..">Back to vocabulary</BackLink>
      <Suspense fallback={<div>Loading...</div>}>
        <h1 class="mb-4 flex items-center justify-center">
          <span class="text-2xl">Test results</span>
          <span class={`fi mx-2 size-4 fi-${vocabularyQuery.data?.country}`} />
          {vocabularyQuery.data?.name}
        </h1>
        <Show when={vocabularyQuery.data?.words}>
          {words => (
            <Show when={lastTestResultQuery.data}>
              {results => (
                <Results
                  results={results()}
                  words={words()}
                  editWord={onWordsEdited}
                  onRepeatAll={onRepeatAll}
                  onRepeat={onRepeat}
                />
              )}
            </Show>
          )}
        </Show>
      </Suspense>
    </main>
  );
};
