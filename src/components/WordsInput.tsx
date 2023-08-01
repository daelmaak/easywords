import style from './WordsInput.module.css';
import { get, set } from 'idb-keyval';
import { Show, createEffect, createSignal } from 'solid-js';
import { SimpleMdParser, WordTranslation } from '../parser/simple-md-parser';

export interface WordsInputProps {
  onWords: (words: WordTranslation[]) => void;
  reverse: boolean;
}

export function WordsInput(props: WordsInputProps) {
  const [fileHandle, setFileHandle] = createSignal<
    FileSystemHandle | undefined
  >(undefined);
  const [lastWords, setLastWords] = createSignal<WordTranslation[]>();

  createEffect(async () => {
    setFileHandle(await get<FileSystemHandle>('file-handle'));
    setLastWords(await get<WordTranslation[]>('last-words'));
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

  function applyLastWords(lastWords: WordTranslation[]) {
    props.onWords(lastWords);
  }

  async function onCPFormSubmit(e: SubmitEvent) {
    e.preventDefault();

    const formdata = new FormData(e.target as HTMLFormElement);
    const words = parseSource(formdata.get('copypastesource') as string);

    setLastWords(words);
    await set('last-words', words);
  }

  function parseSource(text: string) {
    const mdParser = new SimpleMdParser();
    const words = mdParser.parse(text);

    props.onWords(words);

    return words;
  }

  function onKeyDownInCPForm(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      (event.currentTarget as HTMLFormElement).requestSubmit();
    }
  }

  const lastWordsSample = (lastWords: WordTranslation[]) => {
    const words = lastWords.slice(0, 3);
    return props.reverse
      ? words.map(w => w.translation)
      : words.map(w => w.original);
  };

  return (
    <div>
      <Show when={lastWords()} keyed={true}>
        {lws => (
          <button
            class={`block mx-auto text-center ${style.reuseWords}`}
            type="button"
            onClick={_ => applyLastWords(lws)}
          >
            <p class="btn-link mb-2">Use last words</p>
            {lastWordsSample(lws).map(w => (
              <p>{w}</p>
            ))}
          </button>
        )}
      </Show>
      <p class="text-center my-4 text-zinc-400">/</p>
      <form
        class="p-2 bg-zinc-700 rounded-md min-w-[20rem]"
        onKeyDown={onKeyDownInCPForm}
        onSubmit={onCPFormSubmit}
      >
        <textarea
          class="peer input no-scrollbar block min-w-full [&:not(&:placeholder-shown)]:min-h-[10rem] text-sm whitespace-pre"
          name="copypastesource"
          placeholder="Or paste words here"
          rows="1"
        ></textarea>
        <button class="peer-[:placeholder-shown]:hidden btn-primary mt-4 shadow-zinc-800">
          Apply
        </button>
      </form>
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
    </div>
  );
}
