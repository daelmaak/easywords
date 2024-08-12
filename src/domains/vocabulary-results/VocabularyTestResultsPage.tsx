import { createResource, Show, Suspense, type Component } from 'solid-js';
import { Results } from '../vocabulary-testing/components/Results';
import { useNavigate, useParams } from '@solidjs/router';
import {
  fetchVocabulary,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resource';
import { fetchTestResults } from './resources/vocabulary-test-result-resource';
import type { VocabularyItem } from '../vocabularies/model/vocabulary-model';
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

  function onRepeatInvalid(invalidWords: VocabularyItem[]) {
    navigateToVocabularyTest(vocabularyId, navigate, {
      wordIds: invalidWords.map(w => w.id),
    });
  }

  async function onWordsEdited(updatedWord: VocabularyItem) {
    await updateVocabularyItems(updatedWord);
  }

  return (
    <main class="page-container">
      <BackLink href="../..">Back to vocabulary</BackLink>
      <h1 class="mb-4 text-center text-2xl">Test results</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Show when={vocabularyQuery.data?.vocabularyItems}>
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
