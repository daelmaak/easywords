import { get, set } from 'idb-keyval';
import type { Component } from 'solid-js';
import { Show, createEffect, createSignal } from 'solid-js';
import { Switch } from '~/components/ui/switch';
import type { VocabularyTestMode } from './VocabularyTester';

export interface VocabularyTesterSettings {
  mode: VocabularyTestMode;
  reverseTranslations: boolean;
  repeatInvalid: boolean;
  strictMatch: boolean;
}

interface Props {
  settings: VocabularyTesterSettings;
  onChange: (settings: VocabularyTesterSettings) => void;
}

export const VocabularySettings: Component<Props> = props => {
  const [loaded, setLoaded] = createSignal(false);

  createEffect(async () => {
    const storedSettings = await retrieveSetting();

    props.onChange(storedSettings);
    setLoaded(true);
  });

  async function changeSetting(
    key: keyof VocabularyTesterSettings,
    value: boolean | string
  ) {
    const updatedSettings = { ...props.settings, [key]: value };

    props.onChange(updatedSettings);
    await set(`config.vocabulary`, updatedSettings);
  }

  async function retrieveSetting() {
    const storedSettings = await get<Partial<VocabularyTesterSettings>>(
      `config.vocabulary`
    );
    return Object.assign({}, props.settings, storedSettings);
  }

  return (
    <Show when={loaded()}>
      <div class="flex flex-col gap-4">
        <Switch
          checked={props.settings.reverseTranslations}
          label="Reverse"
          onChange={checked => changeSetting('reverseTranslations', checked)}
        />
        <div>
          <Switch
            checked={props.settings.repeatInvalid}
            label="Repeat incorrect words"
            onChange={checked => changeSetting('repeatInvalid', checked)}
          />
          <p class="mt-1 text-sm">
            Words are repeated until you guess them correctly.
          </p>
        </div>
        <Switch
          checked={props.settings.mode === 'write'}
          label="Write words"
          onChange={checked =>
            changeSetting('mode', checked ? 'write' : 'guess')
          }
        />
        <div>
          <Switch
            checked={props.settings.strictMatch}
            label="Strict comparison"
            onChange={checked => changeSetting('strictMatch', checked)}
          />
          <p class="mt-1 text-sm">Diacritics is disregarded when off.</p>
        </div>
      </div>
    </Show>
  );
};
