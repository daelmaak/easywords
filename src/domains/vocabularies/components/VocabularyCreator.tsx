import { Component, For, createSignal } from 'solid-js';
import { CountrySelect } from '~/components/country-select/country-select';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemLabel,
} from '~/components/ui/radio-group';
import {
  WordsInput,
  WordsInputMode,
  wordsInputModes,
} from '~/domains/vocabulary-testing/components/WordsInput';
import { WordTranslation } from '~/model/word-translation';
import { VocabularyToCreate } from '../resources/vocabulary-api';

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
  const [words, setWords] = createSignal<WordTranslation[]>([]);
  const [wordsInputMode, setWordsInputMode] =
    createSignal<WordsInputMode>('form');

  const submit = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const vocabularyName = form.vocabularyName.value;
    const country = form.country.value;

    props.onListCreate({
      name: vocabularyName,
      country,
      vocabularyItems: words(),
    });
  };

  return (
    <>
      <form
        class="w-full mb-4 flex flex-col gap-2"
        data-testid="list-creator"
        id="list-creator-form"
        onSubmit={submit}
      >
        <Label for="vocabulary-name">Vocabulary name</Label>
        <Input id="vocabulary-name" name="vocabularyNname" />
        <Label for="country">Country</Label>
        <CountrySelect id="country" />
      </form>
      <div class="mb-4 flex flex-col gap-2">
        <Label>Add words</Label>
        <RadioGroup
          class="flex mt-2"
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
