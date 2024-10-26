import { HiOutlinePlus, HiOutlineXMark } from 'solid-icons/hi';
import { For, Show, createSignal } from 'solid-js';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { WordsCreatorForm } from '~/domains/vocabularies/components/WordsCreatorForm';
import { WordsCreatorRaw } from '~/domains/vocabularies/components/WordsCreatorRaw';
import type { WordTranslation } from '~/model/word-translation';

export type WordsInputMode = 'text' | 'form';
export const wordsInputModes: WordsInputMode[] = ['form', 'text'];

const formId = 'words-input-form';

export interface WordsInputProps {
  ref?: HTMLFormElement;
  mode: WordsInputMode;
  onWordsChange?: (words: WordTranslation[]) => void;
}

export function WordsInput(props: WordsInputProps) {
  const [words, setWords] = createSignal<WordTranslation[]>([]);

  function onAddWord(word: WordTranslation) {
    setWords(w => w.concat(word));
    props.onWordsChange?.(words());
  }

  function onReplaceWords(newWords: WordTranslation[]) {
    setWords(newWords);
    props.onWordsChange?.(newWords);
  }

  function removeWord(word: WordTranslation) {
    setWords(w => w.filter(w => w.original !== word.original));
    props.onWordsChange?.(words());
  }

  return (
    <div>
      <Show when={props.mode === 'form'}>
        <WordsCreatorForm id={formId} ref={props.ref} onChange={onAddWord} />
      </Show>

      <Show when={props.mode === 'text'}>
        <WordsCreatorRaw
          id={formId}
          ref={props.ref}
          onChange={onReplaceWords}
        />
      </Show>

      <Button
        class="mx-auto mt-4 w-full"
        form={formId}
        variant="defaultOutline"
        type="submit"
      >
        <HiOutlinePlus />
        {props.mode === 'text' ? 'Use words' : 'Add word'}
      </Button>

      <div class="mt-4 flex flex-wrap gap-2">
        <For each={words()}>
          {word => (
            <Badge class="text-sm" variant="secondary">
              {word.original} - {word.translation}
              <HiOutlineXMark
                class="ml-1 cursor-pointer"
                onClick={() => removeWord(word)}
              />
            </Badge>
          )}
        </For>
      </div>
    </div>
  );
}
