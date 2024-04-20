import Fuse from 'fuse.js';
import {
  Component,
  ComponentProps,
  For,
  createSignal,
  splitProps,
} from 'solid-js';
import { Input } from '~/components/ui/input';
import { VocabularyItem, Vocabulary } from '../vocabulary-model';
import { Checkbox } from '~/components/ui/checkbox';

interface VocabularyEditorProps {
  selectedWords: VocabularyItem[];
  vocabulary: Vocabulary;
  onWordsEdited: (words: VocabularyItem[]) => void;
  onWordsSelected: (words: VocabularyItem[]) => void;
}

export const VocabularyEditor: Component<VocabularyEditorProps> = props => {
  const [words, setWords] = createSignal<VocabularyItem[]>(
    props.vocabulary.vocabularyItems
  );

  const fuse = new Fuse(words(), {
    keys: ['original', 'translation'],
    threshold: 0.3,
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
    <>
      <div class="sticky top-0 bg-inherit pt-2 pb-4">
        <div class="flex gap-4">
          <Input
            class="w-auto"
            placeholder="Search..."
            onInput={e => search(e.target.value)}
          />
        </div>
      </div>
      <table>
        <thead class="font-semibold">
          <tr>
            <td></td>
            <td>Original</td>
            <td></td>
            <td>Translation</td>
          </tr>
        </thead>
        <tbody>
          <For each={words()}>
            {word => (
              <tr class="h-10">
                <td>
                  <Checkbox
                    onChange={checked => onWordToggled(word, checked)}
                  />
                </td>
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
