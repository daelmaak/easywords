import type { Component } from 'solid-js';
import { For, createSignal } from 'solid-js';
import { CountrySelect } from '~/components/country-select/country-select';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '~/components/ui/radio-group';
import type { WordsInputMode } from '~/domains/vocabulary-testing/components/WordsInput';
import {
  WordsInput,
  wordsInputModes,
} from '~/domains/vocabulary-testing/components/WordsInput';
import type { CountryCode } from '../../../components/country-select/countries';
import type { Word } from '../model/vocabulary-model';
import type { VocabularyToCreate } from '../resources/vocabulary-resource';

interface Props {
  onListCreate: (vocabulary: VocabularyToCreate) => void;
}

const l10n: { mode: Record<WordsInputMode, string> } = {
  mode: {
    text: 'raw',
    form: 'interactive',
  },
};

export const VocabularyCreator: Component<Props> = props => {
  const [words, setWords] = createSignal<Word[]>([]);
  const [wordsInputMode, setWordsInputMode] =
    createSignal<WordsInputMode>('form');

  const submit = (event: SubmitEvent) => {
    event.preventDefault();

    const formData = new FormData(event.target as HTMLFormElement);

    props.onListCreate({
      name: formData.get('vocabularyName') as string,
      country: formData.get('country') as CountryCode,
      words: words(),
    });
  };

  return (
    <>
      <form
        class="mb-4 flex w-full flex-col gap-2"
        data-testid="list-creator"
        id="list-creator-form"
        onSubmit={submit}
      >
        <Label for="vocabulary-name">Vocabulary name</Label>
        <Input id="vocabulary-name" name="vocabularyName" required />
        <Label for="country">Language</Label>
        <CountrySelect id="country" name="country" required />
      </form>
      <div class="mb-4 flex flex-col gap-2">
        <Label>Add words</Label>
        <RadioGroup
          class="mt-2 flex"
          value={wordsInputMode()}
          onChange={m => setWordsInputMode(m as WordsInputMode)}
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
        <WordsInput mode={wordsInputMode()} onWordsChange={setWords} />
      </div>
      <Button class="w-full" form="list-creator-form" type="submit">
        Create
      </Button>
    </>
  );
};
