import type { Component } from 'solid-js';
import { Show, Suspense } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';
import type { Word } from '../model/vocabulary-model';
import { fetchWordResults } from '~/domains/vocabulary-results/resources/vocabulary-test-result-resource';
import { wordResultsKey } from '~/domains/vocabulary-results/resources/cache-keys';
import { WordDetailResults } from './WordDetailResults';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';

interface WordDetailProps {
  word: Word;
  onWordEdited: (word: Word) => void;
}

export const WordDetail: Component<WordDetailProps> = props => {
  const wordResultsQuery = createQuery(() => ({
    queryKey: wordResultsKey(props.word.id),
    queryFn: () => fetchWordResults(props.word.id),
  }));

  const handleBlur =
    (key: keyof Word) =>
    (
      e: FocusEvent & {
        currentTarget: HTMLInputElement | HTMLTextAreaElement;
      }
    ) => {
      const { value } = e.currentTarget;

      if (value === props.word[key]) {
        return;
      }
      props.onWordEdited({
        ...props.word,
        [key]: value,
      });
    };

  return (
    <div class="h-full w-full overflow-y-auto rounded-lg bg-white p-6 shadow-md">
      {/* Header Section */}
      <div class="mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-800">{props.word.original}</h2>
        <p class="text-xl text-gray-600">{props.word.translation}</p>
      </div>

      {/* Word Section */}
      <div class="mb-6 flex w-full gap-4">
        <div class="flex-grow">
          <label class="mb-2 block font-semibold text-gray-700" for="original">
            Original
          </label>
          <Input
            id="original"
            class="rounded-lg border-none bg-gray-50 p-4 text-gray-600"
            name="original"
            value={props.word.original}
            onBlur={handleBlur('original')}
          />
        </div>

        <div class="flex-grow">
          <label
            class="mb-2 block font-semibold text-gray-700"
            for="translation"
          >
            Translation
          </label>
          <Input
            id="translation"
            class="rounded-lg border-none bg-gray-50 p-4 text-gray-600"
            name="translation"
            value={props.word.translation}
            onBlur={handleBlur('translation')}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div class="mb-6">
        <label class="mb-2 block font-semibold text-gray-700" for="notes">
          Notes
        </label>
        <Textarea
          id="notes"
          class="rounded-lg border-none bg-gray-50 p-4 text-base text-gray-600"
          name="notes"
          placeholder="Notes"
          rows="2"
          value={props.word.notes}
          onBlur={handleBlur('notes')}
        />
      </div>

      <div class="mb-6">
        <label class="mb-2 block font-semibold text-gray-700" for="created">
          Created
        </label>
        <div id="created" class="rounded-lg bg-gray-50 p-4">
          <p class="text-gray-600">
            {new Date(props.word.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div class="mb-6">
        <span class="font-semibold text-gray-700">Test History</span>
        <div class="mt-4 max-h-[30rem] max-w-[60rem]">
          <Suspense>
            <Show
              when={wordResultsQuery.data?.length}
              fallback={
                <div class="flex h-full items-center justify-center text-gray-500">
                  No test results available
                </div>
              }
            >
              <WordDetailResults
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
