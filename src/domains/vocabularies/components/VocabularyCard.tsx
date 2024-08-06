import {
  HiOutlineAcademicCap,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'solid-icons/hi';
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
  onClick?: (id: number) => void;
  onDeleteVocabulary?: (id: number) => void;
  onEditVocabulary: (id: number) => void;
  onTestVocabulary: (
    id: number,
    config?: { useSavedProgress: boolean }
  ) => void;
};

export const VocabularyCard: Component<Props> = props => {
  return (
    <Card
      class="flex flex-col cursor-pointer"
      onClick={() => props.onClick?.(props.vocabulary.id)}
    >
      <CardHeader class="p-4 flex flex-row justify-between items-center gap-4">
        <CardTitle class="text-md">
          <span class={`mr-2 fi fi-${props.vocabulary.country}`}></span>
          {props.vocabulary.name}
        </CardTitle>
        <div class="flex gap-4" onClick={e => e.stopPropagation()}>
          <HiOutlinePencil
            class="cursor-pointer"
            size={16}
            onClick={() => props.onEditVocabulary(props.vocabulary.id)}
          />
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
          <For each={props.vocabulary.vocabularyItems.slice(0, 10)}>
            {item => (
              <li>
                {item.original} - {item.translation}
              </li>
            )}
          </For>
          <Show when={props.vocabulary.vocabularyItems.length > 10}>
            <li class="text-center">...</li>
          </Show>
        </ul>
      </CardContent>
      <CardFooter
        class="mt-auto p-4 pt-0 flex gap-2 justify-end"
        onClick={e => e.stopPropagation()}
      >
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
          onClick={() => props.onTestVocabulary(props.vocabulary.id)}
        >
          <HiOutlineAcademicCap class="mr-1" />
          Test
        </Button>
      </CardFooter>
    </Card>
  );
};
