import { useNavigate } from '@solidjs/router';
import { Component, For, createResource } from 'solid-js';
import { VocabularyCard } from '../vocabularies/components/VocabularyCard';
import { vocabularyApi } from '../vocabularies/resources/vocabulary-api';
import { navigateToVocabularyTest } from '../vocabularies/util/navigation';

export const DashboardPage: Component = () => {
  const navigate = useNavigate();

  const [recentVocabularies] = createResource(() =>
    vocabularyApi.fetchRecentVocabularies(3)
  );

  function onGoToVocabulary(id: number) {
    navigate(`/vocabulary/${id}`);
  }

  function onTestVocabulary(
    id: number,
    config?: { useSavedProgress: boolean }
  ) {
    navigateToVocabularyTest(id, navigate, config);
  }

  return (
    <>
      <h1 class="sr-only">Dashboard</h1>
      <div class="sm:grid sm:grid-cols-2 sm:gap-8">
        <section>
          <h2 class="mb-4 text-lg font-semibold">How to</h2>
          <div style="padding-bottom:56.25%; position:relative; display:block; width: 100%">
            <iframe
              src="https://app.vidcast.io/share/embed/776a0ea3-a1e7-494e-bf5e-6e2a73b34c73"
              width="100%"
              height="100%"
              title="a11y - Navigating vs interacting webpages with NVDA"
              loading="lazy"
              allowfullscreen
              style="position:absolute; top:0; left: 0;border: solid; border-radius:12px;"
            ></iframe>
          </div>
        </section>
        <section>
          <h2 class="mb-4 text-lg font-semibold">Recent vocabularies</h2>
          <div class="flex flex-col gap-4">
            <For each={recentVocabularies()}>
              {vocabulary => (
                <VocabularyCard
                  vocabulary={vocabulary}
                  onClick={onGoToVocabulary}
                  onEditVocabulary={onGoToVocabulary}
                  onTestVocabulary={onTestVocabulary}
                />
              )}
            </For>
          </div>
        </section>
      </div>
    </>
  );
};
