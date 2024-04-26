import { Component, ComponentProps, For, splitProps } from 'solid-js';
import { Checkbox } from '~/components/ui/checkbox';
import { Input } from '~/components/ui/input';
import { Vocabulary, VocabularyItem } from '../vocabulary-model';

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
    <table>
      <thead class="font-semibold text-sm text-center">
        <tr>
          <td></td>
          <td>Original</td>
          <td></td>
          <td>Translation</td>
        </tr>
      </thead>
      <tbody>
        <For each={props.words}>
          {word => (
            <tr class="h-10" data-testid="editor-word">
              <td>
                <Checkbox onChange={checked => onWordToggled(word, checked)} />
              </td>
              <VocabularyEditorCell
                word={word.original}
                onEdit={o => onWordEdited(word, { original: o })}
              />
              <td>
                <span class="mx-2 text-center">-</span>
              </td>
              <VocabularyEditorCell
                word={word.translation}
                onEdit={t => onWordEdited(word, { translation: t })}
              />
            </tr>
          )}
        </For>
      </tbody>
    </table>
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
