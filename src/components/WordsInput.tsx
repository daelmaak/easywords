import { get, set } from 'idb-keyval';
import { Show, createEffect, createSignal } from 'solid-js';
import { SimpleMdParser, WordTranslation } from '../parser/simple-md-parser';

export interface WordsInputProps {
  onWords: (words: WordTranslation[]) => void;
}

export function WordsInput(props: WordsInputProps) {
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

  function parseSource(text: string) {
    const mdParser = new SimpleMdParser();
    const words = mdParser.parse(text);

    props.onWords(words);
  }

  return (
    <>
      <Show keyed={true} when={fileHandle()}>
        {fh => (
          <button class="btn-primary" onClick={() => reuseFile(fh)}>
            Open "{fh.name}"
          </button>
        )}
      </Show>
      <button class="link" onClick={pickFile}>
        Pick file
      </button>
    </>
  );
}
