import { get, set } from 'idb-keyval';
import { Ref, Show, createEffect, createSignal } from 'solid-js';
import { SimpleMdParser, WordTranslation } from '../parser/simple-md-parser';

export interface WordsInputProps {
  onWords: (words: WordTranslation[]) => void;
}

export function WordsInput(props: WordsInputProps) {
  let wordsTextareaRef: HTMLTextAreaElement | undefined;

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
    } catch (ignored) {}

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

  function applyText() {
    const text = wordsTextareaRef?.value ?? '';
    parseSource(text);
  }

  function parseSource(text: string) {
    const mdParser = new SimpleMdParser();
    const words = mdParser.parse(text);

    props.onWords(words);
  }

  return (
    <div>
      <div class="mx-auto flex gap-4 justify-center">
        <Show keyed={true} when={fileHandle()}>
          {fh => (
            <button class="link" onClick={() => reuseFile(fh)}>
              Open "{fh.name}"
            </button>
          )}
        </Show>
        <button class="btn-primary" onClick={pickFile}>
          Pick file
        </button>
      </div>
      <form
        class="mt-8 p-2 bg-zinc-700 rounded-md min-w-[20rem]"
        onSubmit={applyText}
      >
        <textarea
          class="peer input no-scrollbar block min-w-full [&:not(&:placeholder-shown)]:min-h-[10rem] text-sm whitespace-pre"
          name="copypastesource"
          placeholder="Or paste words here"
          rows="1"
          ref={wordsTextareaRef}
        ></textarea>
        <button class="peer-[:placeholder-shown]:hidden btn-primary mt-4 shadow-zinc-800">
          Apply
        </button>
      </form>
    </div>
  );
}
