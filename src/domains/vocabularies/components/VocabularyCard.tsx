import {
  HiOutlineAcademicCap,
  HiOutlinePencil,
  HiOutlineTrash,
} from 'solid-icons/hi';
import { Component, For, Show } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Vocabulary } from '../vocabulary-model';

export type Props = {
  list: Vocabulary;
  onClickVocabulary?: (id: number) => void;
  onDeleteVocabulary: (id: number) => void;
  onEditVocabulary: (id: number) => void;
  onTestVocabulary: (id: number) => void;
};

export const VocabularyCard: Component<Props> = props => {
  return (
    <Card>
      <CardHeader class="flex flex-row justify-between items-center gap-4">
        <CardTitle class="text-md">
          <span class={`mr-2 fi fi-${props.list.country}`}></span>
          {props.list.name}
        </CardTitle>
        <div class="flex gap-4">
          <HiOutlinePencil
            class="cursor-pointer"
            size={16}
            onClick={() => props.onEditVocabulary(props.list.id)}
          />
          <HiOutlineTrash
            class="cursor-pointer"
            size={16}
            onClick={() => props.onDeleteVocabulary(props.list.id)}
          />
        </div>
      </CardHeader>
      <CardContent
        class="overflow-hidden cursor-pointer"
        onClick={() => props.onClickVocabulary?.(props.list.id)}
      >
        <ul>
          <For each={props.list.vocabularyItems.slice(0, 10)}>
            {item => (
              <li>
                {item.original} - {item.translation}
              </li>
            )}
          </For>
          <Show when={props.list.vocabularyItems.length > 10}>
            <li class="text-center">...</li>
          </Show>
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          class="ml-auto"
          size="sm"
          onClick={() => props.onTestVocabulary(props.list.id)}
        >
          <HiOutlineAcademicCap class="mr-1" />
          Test
        </Button>
      </CardFooter>
    </Card>
  );
};
