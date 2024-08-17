import { createResource, Show, Suspense, type Component } from 'solid-js';
import { Results } from '../vocabulary-testing/components/Results';
import { useNavigate, useParams } from '@solidjs/router';
import {
  fetchVocabulary,
  updateWords,
} from '../vocabularies/resources/vocabulary-resource';
import { fetchTestResults } from './resources/vocabulary-test-result-resource';
import type { Word } from '../vocabularies/model/vocabulary-model';
import { navigateToVocabularyTest } from '../vocabularies/util/navigation';
import { BackLink } from '~/components/BackLink';
import { createQuery } from '@tanstack/solid-query';

export const VocabularyTestResultsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;

  const vocabularyQuery = createQuery(() => ({
    queryKey: ['vocabulary', vocabularyId],
    queryFn: () => fetchVocabulary(vocabularyId),
  }));

  const [lastTestResult] = createResource(vocabularyId, fetchTestResults);

  function onRepeatAll() {
    navigate('..');
  }

  function onRepeatInvalid(invalidWords: Word[]) {
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: invalidWords.map(w => w.id),
    });
  }

  async function onWordsEdited(updatedWord: Word) {
    await updateWords(updatedWord);
  }

  return (
    <main class="page-container">
      <BackLink href="../..">Back to vocabulary</BackLink>
      <Suspense fallback={<div>Loading...</div>}>
        <h1 class="mb-4 flex justify-center items-center">
          <span class="text-2xl">Test results</span>
          <span class={`size-4 mx-2 fi fi-${vocabularyQuery.data?.country}`} />
          {vocabularyQuery.data?.name}
        </h1>
        <Show when={vocabularyQuery.data?.words}>
          {words => (
            <Show when={lastTestResult()}>
              {results => (
                <Results
                  results={results()}
                  words={words()}
                  editWord={onWordsEdited}
                  onRepeatAll={onRepeatAll}
                  onRepeatInvalid={onRepeatInvalid}
                />
              )}
            </Show>
          )}
        </Show>
      </Suspense>
    </main>
  );
};
