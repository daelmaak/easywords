import type { Component } from 'solid-js';
import { Show, Suspense } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';
import type { Word } from '../model/vocabulary-model';
import { fetchWordResults } from '~/domains/vocabulary-results/resources/vocabulary-test-result-resource';
import { wordResultsKey } from '~/domains/vocabulary-results/resources/cache-keys';
import { WordDetailResults } from './WordDetailResults';
import { Textarea } from '~/components/ui/textarea';
import { Input } from '~/components/ui/input';
import { HiOutlineTrash, HiOutlineXMark } from 'solid-icons/hi';
import { Button } from '~/components/ui/button';
import { ConfirmationDialog } from '~/components/ConfirmationDialog';
import {
  formatDate,
  THREE_LETTER_MONTH_WITH_YEAR_OPTIONS,
} from '~/util/format-date';
import type { CountryCode } from '../model/countries';

interface WordDetailProps {
  word: Word;
  vocabularyLang: CountryCode;
  onClose?: () => void;
  // TODO: handle inside the component
  onWordEdited: (word: Word) => void;
  onWordDelete: () => void;
}

export const WordDetail: Component<WordDetailProps> = props => {
  const wordResultsQuery = createQuery(() => ({
    queryKey: wordResultsKey(props.word.id),
    queryFn: () =>
      fetchWordResults(props.word.id, { limit: 15, upToDaysAgo: 90 }),
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
    <section
      aria-label={`Word detail: ${props.word.original}`}
      class="relative h-full w-full overflow-y-auto rounded-lg bg-white p-6 shadow-md"
    >
      <Show when={props.onClose}>
        <Button
          size="sm"
          variant="ghost"
          class="absolute right-2 top-4"
          onClick={props.onClose}
        >
          <HiOutlineXMark size={16} />
        </Button>
      </Show>

      <div class="mb-6 border-b pb-4">
        <Show when={props.word.archived}>
          <div class="flex items-center gap-2">
            <span>(Archived)</span>
            <Button
              class="ml-auto mr-8"
              size="sm"
              variant="defaultOutline"
              onClick={() =>
                props.onWordEdited({ ...props.word, archived: false })
              }
            >
              Unarchive
            </Button>
          </div>
        </Show>
        <h2
          class="text-2xl font-bold text-gray-800"
          lang={props.vocabularyLang}
        >
          {props.word.original}
        </h2>
        <p class="text-xl text-gray-800">{props.word.translation}</p>
      </div>

      {/* Word Section */}
      <div class="mb-6 flex w-full gap-4">
        <div class="flex-grow">
          <label class="block font-semibold text-gray-700" for="original">
            Original
          </label>
          <Input
            id="original"
            class="rounded-lg border-input bg-gray-50 px-3 py-2 text-gray-800"
            name="original"
            lang={props.vocabularyLang}
            value={props.word.original}
            onBlur={handleBlur('original')}
          />
        </div>

        <div class="flex-grow">
          <label class="block font-semibold text-gray-700" for="translation">
            Translation
          </label>
          <Input
            id="translation"
            class="rounded-lg border-input bg-gray-50 px-3 py-2 text-gray-800"
            name="translation"
            value={props.word.translation}
            onBlur={handleBlur('translation')}
          />
        </div>
      </div>

      {/* Notes Section */}
      <div class="mb-6">
        <label class="block font-semibold text-gray-700" for="notes">
          Notes
        </label>
        <Textarea
          id="notes"
          class="rounded-lg border-input bg-gray-50 px-3 py-2 text-base text-gray-800"
          name="notes"
          placeholder="Notes"
          rows="2"
          value={props.word.notes}
          onBlur={handleBlur('notes')}
        />
      </div>

      <div class="flex flex-wrap gap-4">
        <div class="mb-2">
          <label class="block text-gray-700" for="created">
            Created
          </label>
          <div
            id="created"
            class="rounded-lg border border-input bg-gray-50 px-3 py-2"
          >
            <p class="text-gray-800">
              {formatDate(
                new Date(props.word.createdAt),
                THREE_LETTER_MONTH_WITH_YEAR_OPTIONS
              )}
            </p>
          </div>
        </div>
        <Show when={props.word.lastTestDate}>
          {lastTestDate => (
            <div class="mb-2">
              <label class="block text-gray-700" for="lastTested">
                Last tested
              </label>
              <div
                id="lastTested"
                class="rounded-lg border border-input bg-gray-50 px-3 py-2"
              >
                <p class="text-gray-800">
                  {formatDate(
                    lastTestDate(),
                    THREE_LETTER_MONTH_WITH_YEAR_OPTIONS
                  )}
                </p>
              </div>
            </div>
          )}
        </Show>
        <Show when={props.word.averageTestScore != null}>
          <div class="mb-2">
            <label class="block text-gray-700" for="lastTested">
              Average test score
            </label>
            <div
              id="lastTested"
              class="rounded-lg border border-input bg-gray-50 px-3 py-2"
            >
              <p class="text-gray-800">
                {props.word.averageTestScore!.toFixed(0)}%
              </p>
            </div>
          </div>
        </Show>
      </div>

      <section class="mb-6 mt-4">
        <h3 class="font-semibold text-gray-700">Test History</h3>
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
      </section>

      <div class="mt-8 flex justify-end gap-4">
        <Show when={!props.word.archived}>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              props.onWordEdited({ ...props.word, archived: true })
            }
          >
            Archive word
          </Button>
        </Show>

        <ConfirmationDialog
          onConfirm={props.onWordDelete}
          confirmText="Delete"
          trigger={p => (
            <Button {...p} size="sm" variant="destructiveOutline">
              <HiOutlineTrash size={16} />
              Delete word
            </Button>
          )}
        />
      </div>
    </section>
  );
};
