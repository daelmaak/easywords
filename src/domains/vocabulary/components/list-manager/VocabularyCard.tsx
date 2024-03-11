import { HiOutlineAcademicCap, HiOutlineTrash } from 'solid-icons/hi';
import { Component, For, Show } from 'solid-js';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { VocabularyList } from '../../vocabulary-model';
import { Button } from '~/components/ui/button';

export type Props = {
  list: VocabularyList;
  onDeleteVocabulary: (id: number) => void;
  onTestVocabulary: (id: number) => void;
};

export const VocabularyCard: Component<Props> = props => {
  return (
    <Card>
      <CardHeader class="flex flex-row justify-between items-center gap-4">
        <CardTitle>{props.list.name}</CardTitle>
        <HiOutlineTrash
          class="cursor-pointer"
          size={16}
          onClick={() => props.onDeleteVocabulary(props.list.id)}
        />
      </CardHeader>
      <CardContent class="overflow-hidden">
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
