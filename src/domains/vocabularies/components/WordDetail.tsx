import type { Component } from 'solid-js';
import { Show, Suspense } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';
import type { Word } from '../model/vocabulary-model';
import { fetchWordResults } from '~/domains/vocabulary-results/resources/vocabulary-test-result-resource';
import { wordResultsKey } from '~/domains/vocabulary-results/resources/cache-keys';
import { WordDetailProgress } from './WordDetailProgress';

interface WordDetailProps {
  word: Word;
}

export const WordDetail: Component<WordDetailProps> = props => {
  const wordResultsQuery = createQuery(() => ({
    queryKey: wordResultsKey(props.word.id),
    queryFn: () => fetchWordResults(props.word.id),
  }));

  return (
    <div class="h-full w-full overflow-y-auto rounded-lg bg-white p-6 shadow-md">
      {/* Header Section */}
      <div class="mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-800">{props.word.original}</h2>
        <p class="text-xl text-gray-600">{props.word.translation}</p>
      </div>

      {/* Details Section */}
      <div class="mb-6 grid grid-cols-2 gap-4">
        <div class="rounded-lg bg-gray-50 p-4">
          <h3 class="mb-2 font-semibold text-gray-700">Created</h3>
          <p class="text-gray-600">
            {new Date(props.word.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Notes Section */}
      <div class="mb-6">
        <h3 class="mb-2 font-semibold text-gray-700">Notes</h3>
        <p class="rounded-lg bg-gray-50 p-4 text-gray-600">
          {props.word.notes || 'No notes available'}
        </p>
      </div>

      <div class="mb-6">
        <h3 class="mb-4 font-semibold text-gray-700">Test History</h3>
        <div>
          <Suspense>
            <Show
              when={wordResultsQuery.data?.length}
              fallback={
                <div class="flex h-full items-center justify-center text-gray-500">
                  No test results available
                </div>
              }
            >
              <WordDetailProgress
                word={props.word}
                results={wordResultsQuery.data}
              />
            </Show>
          </Suspense>
        </div>
      </div>
    </div>
  );
};
