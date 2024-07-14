import { HiOutlinePencil, HiSolidInformationCircle } from 'solid-icons/hi';
import { Component, Show } from 'solid-js';
import {
  PopoverTrigger,
  PopoverContent,
  Popover,
} from '../../../components/ui/popover';
import { Checkbox } from '../../../components/ui/checkbox';
import { VocabularyItem } from '../model/vocabulary-model';

interface Props {
  word: VocabularyItem;
  onWordToggled: (word: VocabularyItem, selected: boolean) => void;
  onWordDetailToOpen: (word: VocabularyItem) => void;
}

export const VocabularyEditorWord: Component<Props> = props => {
  return (
    <div class="flex items-center gap-2" data-testid="editor-word">
      <Checkbox
        onChange={checked => props.onWordToggled(props.word, checked)}
      />
      <span>{props.word.original}</span>
      <span class="mx-2 text-center">-</span>
      <span>{props.word.translation}</span>
      <HiOutlinePencil
        class="mt-1 opacity-50 cursor-pointer hover:opacity-80"
        title="Edit word"
        onClick={() => props.onWordDetailToOpen(props.word)}
      />
      <Show when={props.word.notes}>
        <Popover>
          <PopoverTrigger>
            <HiSolidInformationCircle
              class="mt-1 text-blue-600 hover:text-blue-900"
              size={20}
              title="Show notes"
            />
          </PopoverTrigger>
          <PopoverContent>{props.word.notes}</PopoverContent>
        </Popover>
      </Show>
    </div>
  );
};
