import { A, useNavigate } from '@solidjs/router';
import { createQuery } from '@tanstack/solid-query';
import { HiOutlinePlus } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { For, Suspense } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Routes } from '~/routes/routes';
import { VocabularyCard } from '../vocabularies/components/VocabularyCard';
import {
  fetchRecentVocabularies,
  VOCABULARIES_QUERY_KEY,
} from '../vocabularies/resources/vocabularies-resource';
import { navigateToVocabularyTest } from '../vocabulary-testing/util/navigation';
import type { Vocabulary } from '../vocabularies/model/vocabulary-model';

export const DashboardPage: Component = () => {
  const navigate = useNavigate();

  const recentVocabulariesQuery = createQuery(() => ({
    queryKey: [VOCABULARIES_QUERY_KEY, { type: 'recent' }],
    queryFn: () => fetchRecentVocabularies(6),
  }));

  function onGoToVocabulary(id: number) {
    navigate(`${Routes.Vocabularies}/${id}`);
  }

  function onCreateVocabulary() {
    navigate(`${Routes.Vocabularies}?openVocabCreator=true`);
  }

  function onTestVocabulary(vocabulary: Vocabulary, testId?: number) {
    navigateToVocabularyTest(vocabulary.id, navigate, {
      testId,
    });
  }

  return (
    <>
      <h1 class="sr-only">Dashboard</h1>
      <div>
        <section class="rounded-b-xl bg-gray-100 p-6">
          <div class="mb-4 flex items-center gap-4">
            <h2 class="text-lg font-semibold">Recent vocabularies</h2>
            <A href={Routes.Vocabularies} class="text-primary">
              See all
            </A>
          </div>
          <div class="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto">
            <Suspense fallback={<div>Loading...</div>}>
              <For
                each={recentVocabulariesQuery.data}
                fallback={
                  <div class="grid min-h-40 w-full">
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
                    wordCount={5}
                    class="hidden flex-grow lg:block lg:flex-grow-0 [&:nth-child(-n+3)]:block"
                    onClick={onGoToVocabulary}
                    onTestVocabulary={onTestVocabulary}
                  />
                )}
              </For>
            </Suspense>
          </div>
        </section>
        <section class="mx-auto max-w-[40rem] p-6">
          <h2 class="mb-4 text-lg font-semibold">How to</h2>
          <div style="padding-bottom:56.25%; position:relative; display:block; width: 100%">
            <iframe
              src="https://app.vidcast.io/share/embed/7c72416a-a85a-4cc0-8603-d1765974d1c3"
              width="100%"
              height="100%"
              title="Watch how to use Easywords"
              loading="lazy"
              allowfullscreen
              style="position:absolute; top:0; left: 0;border: solid; border-radius:12px;"
            ></iframe>
          </div>
        </section>
      </div>
    </>
  );
};
