import { Component, For, splitProps } from 'solid-js';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';
import { ComponentProps } from 'solid-js';
import { Input } from '~/components/ui/input';

interface VocabularyEditorProps {
  vocabulary: VocabularyList;
  onWordEdited: (word: VocabularyItem) => void;
}

export const VocabularyEditor: Component<VocabularyEditorProps> = props => {
  function onWordEdited(
    word: VocabularyItem,
    change: { original?: string; translation?: string }
  ) {
    props.onWordEdited({ ...word, ...change });
  }

  return (
    <table>
      <thead class="font-semibold">
        <tr>
          <td>Original</td>
          <td></td>
          <td>Translation</td>
        </tr>
      </thead>
      <tbody>
        <For each={props.vocabulary.vocabularyItems}>
          {word => (
            <tr class="h-10">
              <VocabularyEditorCell
                word={word.original}
                onEdit={o => onWordEdited(word, { original: o })}
              />
              <td>
                <span class="mx-4 text-center">-</span>
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

  return (
    <td {...rest}>
      <Input class="h-8" value={word} onBlur={e => onEdit(e.target.value)} />
    </td>
  );
};
