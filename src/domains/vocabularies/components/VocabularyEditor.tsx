import Fuse from 'fuse.js';
import {
  Component,
  ComponentProps,
  For,
  createSignal,
  splitProps,
} from 'solid-js';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { VocabularyItem, VocabularyList } from '../vocabulary-model';

interface VocabularyEditorProps {
  vocabulary: VocabularyList;
  onWordsEdited: (words: VocabularyItem[]) => void;
}

export const VocabularyEditor: Component<VocabularyEditorProps> = props => {
  const [editedWords, setEditedWords] = createSignal<VocabularyItem[]>([]);
  const [words, setWords] = createSignal<VocabularyItem[]>(
    props.vocabulary.vocabularyItems
  );
  const fuse = new Fuse(words(), {
    keys: ['original', 'translation'],
  });

  function search(query: string) {
    if (!query) {
      return setWords(props.vocabulary.vocabularyItems);
    }
    const result = fuse.search(query);
    setWords(result.map(r => r.item));
  }

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
      <div class="mb-4 flex gap-4">
        <Input
          class="w-auto"
          placeholder="Search..."
          onInput={e => search(e.target.value)}
        />
        <Button class="ml-auto" onClick={onSubmit}>
          Save changes
        </Button>
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
          <For each={words()}>
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

export default VocabularyEditor;
