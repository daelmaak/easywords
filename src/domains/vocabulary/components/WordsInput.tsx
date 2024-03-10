import { HiOutlineXMark } from 'solid-icons/hi';
import { For, Show, createSignal } from 'solid-js';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '~/components/ui/radio-group';
import { Textarea } from '~/components/ui/textarea';
import { WordTranslation } from '~/model/word-translation';

const l10n: { mode: Record<WordsInputMode, string> } = {
  mode: {
    text: 'raw',
    form: 'interactive',
  },
};

export type WordsInputMode = 'text' | 'form';
export const wordsInputModes: WordsInputMode[] = ['form', 'text'];

export interface WordsInputProps {
  onWordsChange?: (words: WordTranslation[]) => void;
}

export function WordsInput(props: WordsInputProps) {
  const [mode, setMode] = createSignal<WordsInputMode>('form');
  const [words, setWords] = createSignal<WordTranslation[]>([]);

  function onAddWord(e: SubmitEvent) {
    e.preventDefault();

    const formdata = new FormData(e.target as HTMLFormElement);
    let original = formdata.get('original') as string;
    let translation = formdata.get('translation') as string;

    if (!original || !translation) {
      return;
    }

    original = original.trim();
    translation = translation.trim();

    setWords(w => w.concat({ original, translation }));

    const form = e.target as HTMLFormElement;
    form.reset();
    form.querySelector('input')?.focus();

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
      <RadioGroup
        class="flex mb-4"
        value={mode()}
        onChange={m => setMode(m as WordsInputMode)}
      >
        <For each={wordsInputModes}>
          {mode => (
            <RadioGroupItem value={mode}>
              <RadioGroupItemLabel class="text-xs">
                {l10n.mode[mode]}
              </RadioGroupItemLabel>
            </RadioGroupItem>
          )}
        </For>
      </RadioGroup>

      <Show when={mode() === 'form'}>
        <form class="flex gap-2" id="words-form-input" onSubmit={onAddWord}>
          <div class="flex flex-col gap-2">
            <Label class="text-xs" for="word-original">
              Original
            </Label>
            <Input id="word-original" name="original" />
          </div>
          <div class="flex flex-col gap-2">
            <Label class="text-xs" for="word-translation">
              Translation
            </Label>
            <Input id="word-translation" name="translation" />
          </div>
          <Button
            class="ml-auto self-end"
            form="words-form-input"
            variant="link"
            type="submit"
          >
            Add
          </Button>
        </form>
        <div class="flex flex-wrap gap-2">
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
      </Show>

      <Show when={mode() === 'text'}>
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
