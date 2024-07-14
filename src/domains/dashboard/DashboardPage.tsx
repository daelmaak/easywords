import { useNavigate } from '@solidjs/router';
import { Component, For, createResource } from 'solid-js';
import { VocabularyCard } from '../vocabularies/components/VocabularyCard';
import { navigateToVocabularyTest } from '../vocabularies/util/navigation';
import { Button } from '~/components/ui/button';
import { HiOutlinePlus } from 'solid-icons/hi';
import { fetchRecentVocabularies } from '../vocabularies/resources/vocabularies-resource';

export const DashboardPage: Component = () => {
  const navigate = useNavigate();

  const [recentVocabularies] = createResource(() => fetchRecentVocabularies(3));

  function onGoToVocabulary(id: number) {
    navigate(`/vocabulary/${id}`);
  }

  function onCreateVocabulary() {
    navigate('/vocabulary?openVocabCreator=true');
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
      <div class="sm:grid sm:grid-cols-[3fr,2fr] sm:8 sm:content-start 2xl:gap-20">
        <section class="p-6">
          <h2 class="mb-4 text-lg font-semibold">How to</h2>
          <div style="padding-bottom:56.25%; position:relative; display:block; width: 100%">
            <iframe
              src="https://app.vidcast.io/share/embed/d851cd74-8275-4b09-8e62-ff0646e66b53"
              width="100%"
              height="100%"
              title="Watch how to use Easywords"
              loading="lazy"
              allowfullscreen
              style="position:absolute; top:0; left: 0;border: solid; border-radius:12px;"
            ></iframe>
          </div>
        </section>
        <section class="bg-gray-100 rounded-b-xl p-6">
          <h2 class="mb-4 text-lg font-semibold">Recent vocabularies</h2>
          <div class="flex flex-col gap-4">
            <For
              each={recentVocabularies()}
              fallback={
                <div class="w-full min-h-40 grid">
                  <div class="m-auto text-center">
                    <p class="mb-4">
                      Easywords is all about Vocabularies, so why don't you
                      start off by creating one?
                    </p>
                    <Button
                      onClick={onCreateVocabulary}
                      aria-label="Create first vocabulary"
                    >
                      <HiOutlinePlus size={16} /> Create first
                    </Button>
                  </div>
                </div>
              }
            >
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
