import { get, set } from 'idb-keyval';
import { Component, Show, createEffect, createSignal } from 'solid-js';
import { Toggle } from '../../components/Toggle';
import { TestMode } from './Tester';

interface ConfigProps {
  reverseTranslations: (reverse: boolean) => void;
  modeChange: (mode: TestMode) => void;
}

export const Config: Component<ConfigProps> = props => {
  const [loaded, setLoaded] = createSignal(false);

  let storedMode: TestMode | undefined;
  let storedReverseTranslations: boolean | undefined;

  createEffect(async () => {
    storedMode = (await get<TestMode>('config.mode')) ?? 'write';
    storedReverseTranslations =
      (await get<boolean>('config.reverseTranslations')) ?? false;

    props.modeChange(storedMode);
    props.reverseTranslations(storedReverseTranslations);

    setLoaded(true);
  });

  async function changeMode(mode: TestMode) {
    props.modeChange(mode);
    await set('config.mode', mode);
  }

  async function changeReverseTranslations(reverse: boolean) {
    props.reverseTranslations(reverse);
    await set('config.reverseTranslations', reverse);
  }

  return (
    <Show when={loaded()}>
      <div class="mt-20 flex justify-center gap-4 text-slate-400">
        <Toggle
          defaultValue={storedReverseTranslations}
          label="Reverse"
          onChange={changeReverseTranslations}
        />
        <Toggle
          defaultValue={storedMode === 'write'}
          label="Write words"
          onChange={checked => changeMode(checked ? 'write' : 'guess')}
        />
      </div>
    </Show>
  );
};
