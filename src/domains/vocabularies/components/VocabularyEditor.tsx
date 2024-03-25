import { Component, For, createSignal, splitProps } from 'solid-js';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';
import { ComponentProps } from 'solid-js';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';

interface VocabularyEditorProps {
  vocabulary: VocabularyList;
  onWordsEdited: (words: VocabularyItem[]) => void;
}

export const VocabularyEditor: Component<VocabularyEditorProps> = props => {
  const [editedWords, setEditedWords] = createSignal<VocabularyItem[]>([]);

  function onWordEdited(
    word: VocabularyItem,
    change: { original?: string; translation?: string }
  ) {
    setEditedWords(ws =>
      ws.filter(w => w.id !== word.id).concat({ ...word, ...change })
    );
  }

  function onSubmit() {
    props.onWordsEdited(editedWords());
  }

  return (
    <>
      <div class="mb-4 flex">
        <Button class="ml-auto" onClick={onSubmit}>Save changes</Button>
      </div>
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
    </>
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
