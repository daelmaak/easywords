import { get, set } from 'idb-keyval';
import { Component, Show, createEffect, createSignal } from 'solid-js';
import { Toggle } from '../../components/Toggle';
import { VocabularyTestMode } from './Tester';

export interface VocabularyUserSettings {
  mode: VocabularyTestMode;
  reverseTranslations: boolean;
  repeatInvalid: boolean;
}

interface Props {
  settings: VocabularyUserSettings;
  onChange: (settings: VocabularyUserSettings) => void;
}

export const VocabularySettings: Component<Props> = props => {
  const [loaded, setLoaded] = createSignal(false);

  createEffect(async () => {
    const storedSettings = await retrieveSetting();

    props.onChange(storedSettings);
    setLoaded(true);
  });

  function changeSetting(key: keyof VocabularyUserSettings, value: any) {
    const updatedSettings = { ...props.settings, [key]: value };

    props.onChange(updatedSettings);
    set(`config.vocabulary`, updatedSettings);
  }

  async function retrieveSetting() {
    const storedSettings = await get<Partial<VocabularyUserSettings>>(
      `config.vocabulary`
    );
    return Object.assign({}, props.settings, storedSettings);
  }

  return (
    <Show when={loaded()}>
      <div class="mt-20 flex flex-wrap justify-center gap-4 text-slate-400">
        <Toggle
          checked={props.settings.reverseTranslations}
          label="Reverse"
          onChange={checked => changeSetting('reverseTranslations', checked)}
        />
        <Toggle
          checked={props.settings.repeatInvalid}
          label="Repeat incorrect words"
          onChange={checked => changeSetting('repeatInvalid', checked)}
        />
        <Toggle
          checked={props.settings.mode === 'write'}
          label="Write words"
          onChange={checked =>
            changeSetting('mode', checked ? 'write' : 'pick')
          }
        />
      </div>
    </Show>
  );
};
