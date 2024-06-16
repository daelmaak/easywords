import { Component, ComponentProps, For, splitProps } from 'solid-js';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Vocabulary, VocabularyItem } from '../model/vocabulary-model';

interface VocabularyEditorProps {
  words: VocabularyItem[];
  selectedWords: VocabularyItem[];
  vocabulary: Vocabulary;
  onWordsEdited: (words: VocabularyItem[]) => void;
  onWordsSelected: (words: VocabularyItem[]) => void;
}

export const VocabularyEditor: Component<VocabularyEditorProps> = props => {
  function onWordEdited(
    word: VocabularyItem,
    change: { original?: string; translation?: string }
  ) {
    props.onWordsEdited([{ ...word, ...change }]);
  }

  function onWordToggled(word: VocabularyItem, selected: boolean) {
    const selectedWords = props.selectedWords;
    if (selected) {
      props.onWordsSelected([...selectedWords, word]);
    } else {
      props.onWordsSelected(selectedWords.filter(w => w !== word));
    }
  }

  return (
    <div class="w-full grid justify-center content-start grid-cols-[repeat(auto-fit,_20rem)] gap-2">
      <For each={props.words}>
        {word => (
          <div class="flex items-center gap-2" data-testid="editor-word">
            <Checkbox onChange={checked => onWordToggled(word, checked)} />
            <span>{word.original}</span>
            <span class="mx-2 text-center">-</span>
            <span>{word.translation}</span>
          </div>
        )}
      </For>
    </div>
  );
};

interface VocabularyEditorCellProps extends ComponentProps<'td'> {
  word: string;
  onEdit: (word: string) => void;
}

const VocabularyEditorCell: Component<VocabularyEditorCellProps> = props => {
  const [{ word, onEdit }, rest] = splitProps(props, ['word', 'onEdit']);

  function onBlur(updatedWord: string) {
    if (word === updatedWord) return;

    onEdit(updatedWord);
  }

  return (
    <td {...rest}>
      <Input class="h-8" value={word} onBlur={e => onBlur(e.target.value)} />
    </td>
  );
};

export default VocabularyEditor;
