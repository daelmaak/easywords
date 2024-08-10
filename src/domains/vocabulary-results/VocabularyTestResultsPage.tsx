import { createResource, Show, type Component } from 'solid-js';
import { Results } from '../vocabulary-testing/components/Results';
import { useNavigate, useParams } from '@solidjs/router';
import {
  getVocabularyResource,
  updateVocabularyItems,
} from '../vocabularies/resources/vocabulary-resource';
import { fetchTestResults } from './resources/vocabulary-test-result-resource';
import type { VocabularyItem } from '../vocabularies/model/vocabulary-model';
import { navigateToVocabularyTest } from '../vocabularies/util/navigation';
import { BackLink } from '~/components/BackLink';

export const VocabularyTestResultsPage: Component = () => {
  const params = useParams();
  const navigate = useNavigate();
  const vocabularyId = +params.id;
  const vocabulary = getVocabularyResource(vocabularyId);
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
      <h1 class="text-center text-2xl">Test results</h1>
      <Show when={!vocabulary.loading && vocabulary()?.vocabularyItems}>
        {words => (
          <Show when={!lastTestResult.loading && lastTestResult()}>
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
    </main>
  );
};
