import { HiOutlineAcademicCap, HiOutlineTrash } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
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
  onDeleteVocabulary?: (id: number) => void;
  onTestVocabulary: (
    id: number,
    config?: { useSavedProgress: boolean }
  ) => void;
};

export const VocabularyCard: Component<Props> = props => {
  const wordCount = () => props.wordCount ?? 10;

  return (
    <button
      class={props.class}
      onClick={() => props.onClick?.(props.vocabulary.id)}
    >
      <Card>
        <CardHeader class="p-4 flex flex-row justify-between items-center gap-4">
          <CardTitle class="text-md">
            <span class={`mr-2 fi fi-${props.vocabulary.country}`}></span>
            {props.vocabulary.name}
          </CardTitle>
          <div class="flex gap-4" onClick={e => e.stopPropagation()}>
            <Show when={props.onDeleteVocabulary}>
              <HiOutlineTrash
                class="cursor-pointer"
                size={16}
                onClick={() => props.onDeleteVocabulary?.(props.vocabulary.id)}
              />
            </Show>
          </div>
        </CardHeader>
        <CardContent class="px-4 pt-0 pb-2 overflow-hidden">
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
          <div class="ml-auto flex gap-2" onClick={e => e.stopPropagation()}>
            <Show when={props.vocabulary.savedProgress}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  props.onTestVocabulary(props.vocabulary.id, {
                    useSavedProgress: true,
                  })
                }
              >
                <HiOutlineAcademicCap class="mr-1" />
                Continue Test
              </Button>
            </Show>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                props.onTestVocabulary(props.vocabulary.id);
              }}
            >
              <HiOutlineAcademicCap class="mr-1" />
              Test
            </Button>
          </div>
        </CardFooter>
      </Card>
    </button>
  );
};
