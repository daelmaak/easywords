import { get, set } from 'idb-keyval';
import { Component, Show, createEffect, createSignal } from 'solid-js';
import { Toggle } from '../../components/Toggle';
import { VocabularyTestMode } from './Tester';

interface ConfigProps {
  onRepeatInvalid: (repeat: boolean) => void;
  reverseTranslations: (reverse: boolean) => void;
  modeChange: (mode: VocabularyTestMode) => void;
}

export const Config: Component<ConfigProps> = props => {
  const [loaded, setLoaded] = createSignal(false);

  let storedMode: VocabularyTestMode | undefined;
  let storedReverseTranslations: boolean | undefined;
  let storedRepeatInvalid: boolean | undefined;

  createEffect(async () => {
    storedMode =
      (await get<VocabularyTestMode>('config.vocabulary.mode')) ?? 'write';
    storedReverseTranslations =
      (await get<boolean>('config.vocabulary.reverseTranslations')) ?? false;
    storedRepeatInvalid =
      (await get<boolean>('config.vocabulary.repeatInvalid')) ?? false;

    props.modeChange(storedMode);
    props.reverseTranslations(storedReverseTranslations);
    props.onRepeatInvalid(storedRepeatInvalid);

    setLoaded(true);
  });

  async function changeMode(mode: VocabularyTestMode) {
    props.modeChange(mode);
    await set('config.vocabulary.mode', mode);
  }

  async function changeReverseTranslations(reverse: boolean) {
    props.reverseTranslations(reverse);
    await set('config.vocabulary.reverseTranslations', reverse);
  }

  async function setRepeatInvalid(repeat: boolean) {
    props.onRepeatInvalid(repeat);
    await set('config.vocabulary.repeatInvalid', repeat);
  }

  return (
    <Show when={loaded()}>
      <div class="mt-20 flex flex-wrap justify-center gap-4 text-slate-400">
        <Toggle
          defaultValue={storedReverseTranslations}
          label="Reverse"
          onChange={changeReverseTranslations}
        />
        <Toggle
          defaultValue={storedRepeatInvalid}
          label="Repeat incorrect words"
          onChange={checked => setRepeatInvalid(checked)}
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
