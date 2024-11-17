import type { Component } from 'solid-js';
import { For } from 'solid-js';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import type { Vocabulary } from '../model/vocabulary-model';

export type Props = {
  vocabulary: Vocabulary;
  wordCount?: number;
  class?: string;
  onClick?: (id: number) => void;
  onTestVocabulary: (vocabulary: Vocabulary, testId?: number) => void;
};

export const VocabularyCard: Component<Props> = props => {
  const wordCount = () => props.wordCount ?? 10;

  return (
    <button
      class={props.class}
      onClick={() => props.onClick?.(props.vocabulary.id)}
    >
      <Card>
        <CardHeader class="flex flex-row flex-wrap items-center justify-between gap-x-2 px-4 py-3 sm:p-4">
          <CardTitle class="text-md">
            <span class={`fi mr-2 fi-${props.vocabulary.country}`}></span>
            {props.vocabulary.name}
          </CardTitle>
          <span class="mt-0 text-xs text-neutral-500">
            {props.vocabulary.words.length} words
          </span>
        </CardHeader>
        <CardContent class="overflow-hidden px-4 pb-2 pt-0">
          <ul class="text-center">
            <For each={props.vocabulary.words.slice(0, wordCount())}>
              {item => (
                <li class="truncate">
                  {item.original} - {item.translation}
                </li>
              )}
            </For>
          </ul>
        </CardContent>
        <CardFooter class="mt-auto p-4 pt-0">
          <div
            class="flex w-full items-center gap-2"
            onClick={e => e.stopPropagation()}
          >
            <span class="mr-auto text-left text-xs text-neutral-500">
              Last change: {props.vocabulary.updatedAt?.toLocaleDateString()}
            </span>
            {/* <Show when={props.vocabulary.testInProgressId}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  props.onTestVocabulary(
                    props.vocabulary,
                    props.vocabulary.testInProgressId
                  )
                }
              >
                <HiOutlineAcademicCap class="mr-1" />
                Continue Test
              </Button>
            </Show> */}
          </div>
        </CardFooter>
      </Card>
    </button>
  );
};
