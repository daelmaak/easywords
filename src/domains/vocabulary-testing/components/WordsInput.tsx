import { HiOutlineXMark } from 'solid-icons/hi';
import { For, Show, createSignal } from 'solid-js';
import { Badge } from '~/components/ui/badge';
import { Textarea } from '~/components/ui/textarea';
import { WordCreator } from '~/domains/vocabularies/components/WordCreator';
import type { WordTranslation } from '~/model/word-translation';

export type WordsInputMode = 'text' | 'form';
export const wordsInputModes: WordsInputMode[] = ['form', 'text'];

export interface WordsInputProps {
  mode: WordsInputMode;
  onWordsChange?: (words: WordTranslation[]) => void;
}

export function WordsInput(props: WordsInputProps) {
  const [words, setWords] = createSignal<WordTranslation[]>([]);

  function onAddWord(word: WordTranslation) {
    setWords(w => w.concat(word));
    props.onWordsChange?.(words());
  }

  function onAddWordsFromTextArea(e: Event) {
    const textarea = e.target as HTMLTextAreaElement;
    const words = textarea.value
      .split('\n')
      .filter(l => l)
      .map(line => {
        const [original, translation] = line.split(' - ').map(w => w.trim());
        return { original, translation };
      });

    setWords(words);
    props.onWordsChange?.(words);
  }

  function removeWord(word: WordTranslation) {
    setWords(w => w.filter(w => w.original !== word.original));
    props.onWordsChange?.(words());
  }

  return (
    <>
      <Show when={props.mode === 'form'}>
        <div>
          <WordCreator
            ctaLabel="Add"
            ctaVariant="secondary"
            onChange={onAddWord}
          />

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
      </Show>

      <Show when={props.mode === 'text'}>
        <Textarea
          id="words-input"
          name="words-input"
          onBlur={onAddWordsFromTextArea}
        ></Textarea>
        <div class="mt-2 text-xs text-center text-zinc-400">
          words have to be in format:
          <figure>
            <pre class="mt-2">
              original - translation
              <br />
              original2 - translation2
            </pre>
          </figure>
        </div>
      </Show>
    </>
  );
}
