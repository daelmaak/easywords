import { get, set } from 'idb-keyval';
import { HiOutlineXMark } from 'solid-icons/hi';
import { For, JSX, Show, createEffect, createSignal } from 'solid-js';
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
import { SimpleMdParser, WordTranslation } from '~/parser/simple-md-parser';

export type WordsInputMode = 'text' | 'form';
export const wordsInputModes: WordsInputMode[] = ['text', 'form'];

export interface WordsInputProps {
  onWordsSelect?: (words: WordTranslation[]) => void;
  children?: JSX.Element;
}

export function WordsInput(props: WordsInputProps) {
  const [mode, setMode] = createSignal<WordsInputMode>('form');
  const [words, setWords] = createSignal<WordTranslation[]>([]);

  const [fileHandle, setFileHandle] = createSignal<
    FileSystemHandle | undefined
  >(undefined);

  createEffect(async () => {
    setFileHandle(await get<FileSystemHandle>('file-handle'));
  });

  async function reuseFile(fileHandle: FileSystemHandle) {
    if ((await fileHandle.requestPermission()) !== 'granted') {
      return;
    }

    applyFile(fileHandle);
  }

  async function pickFile() {
    let fileHandle: FileSystemHandle | undefined;

    try {
      [fileHandle] = await window.showOpenFilePicker();
    } catch {}

    if (!fileHandle) {
      return;
    }

    setFileHandle(fileHandle);
    set('file-handle', fileHandle);

    applyFile(fileHandle);
  }

  async function applyFile(fileHandle: FileSystemHandle) {
    const file = await fileHandle.getFile();
    const text = await file.text();

    parseSource(text);
  }

  async function onAddWord(e: SubmitEvent) {
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
  }

  function parseSource(text: string) {
    const mdParser = new SimpleMdParser();
    const words = mdParser.parse(text);

    props.onWordsSelect?.(words);

    return words;
  }

  function removeWord(word: WordTranslation) {
    setWords(w => w.filter(w => w.original !== word.original));
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
              <RadioGroupItemLabel>{mode}</RadioGroupItemLabel>
            </RadioGroupItem>
          )}
        </For>
      </RadioGroup>

      <Show when={mode() === 'form'}>
        <form class="flex gap-2" id="words-form-input" onSubmit={onAddWord}>
          <div class="flex flex-col gap-2">
            <Label class="text-xs" for="original">
              Original
            </Label>
            <Input id="original" name="original" />
          </div>
          <div class="flex flex-col gap-2">
            <Label class="text-xs" for="translation">
              Translation
            </Label>
            <Input id="translation" name="translation" />
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
        <Textarea id="words-input" name="words-input"></Textarea>
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

      <Show when={false}>
        <p class="text-center my-4 text-zinc-400">/</p>
        <div class="mx-auto flex gap-4 justify-center">
          <Show keyed={true} when={fileHandle()}>
            {fh => (
              <button class="btn-link" onClick={() => reuseFile(fh)}>
                Open "{fh.name}"
              </button>
            )}
          </Show>
          <button class="btn-link" onClick={pickFile}>
            Pick file
          </button>
        </div>
      </Show>
    </>
  );
}
