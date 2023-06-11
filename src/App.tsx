import { createEffect, type Component, createSignal, Show } from 'solid-js';
import { get, set } from 'idb-keyval';
import Tester from './Tester';
import { SimpleMdParser, WordTranslation } from './parser/simple-md-parser';

const App: Component = () => {
  const mdParser = new SimpleMdParser();

  const [words, setWords] = createSignal<WordTranslation[]>();
  const [fileHandle, setFileHandle] = createSignal<
    FileSystemHandle | undefined
  >(undefined);

  createEffect(async () => {
    setFileHandle(await get<FileSystemHandle>('file-handle'));
  });

  async function reuseSource(fileHandle: FileSystemHandle) {
    if ((await fileHandle.requestPermission()) !== 'granted') {
      return;
    }

    applySource(fileHandle);
  }

  async function pickSource() {
    let fileHandle: FileSystemHandle | undefined;

    try {
      [fileHandle] = await window.showOpenFilePicker();
    } catch (ignored) {}

    if (!fileHandle) {
      return;
    }

    setFileHandle(fileHandle);
    set('file-handle', fileHandle);

    applySource(fileHandle);
  }

  async function applySource(fileHandle: FileSystemHandle) {
    const file = await fileHandle.getFile();
    const text = await file.text();
    const words = mdParser.parse(text);

    setWords(words);
  }

  return (
    <div>
      <Show keyed={true} when={fileHandle()}>
        {fh => <button onClick={() => reuseSource(fh)}>Use {fh.name}</button>}
      </Show>
      <button onClick={pickSource}>Pick source</button>

      <Show keyed={true} when={words()}>
        {w => <Tester words={w} />}
      </Show>
    </div>
  );
};

export default App;
