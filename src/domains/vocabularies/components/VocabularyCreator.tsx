import { Component, For, createSignal } from 'solid-js';
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

interface Props {
  onListCreate: (name: string, words: WordTranslation[]) => void;
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
    const listName = form.listName.value;

    props.onListCreate(listName, words());
  };

  return (
    <>
      <form
        class="w-full"
        data-testid="list-creator"
        id="list-creator-form"
        onSubmit={submit}
      >
        <div class="mb-4 flex flex-col gap-2">
          <Label for="list-name">List name</Label>
          <Input id="list-name" name="listName" />
        </div>
      </form>
      <div class="mb-4 flex flex-col gap-2">
        <RadioGroup
          class="flex mb-4"
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
        <Label>Words</Label>
        <WordsInput mode={wordsInputMode()} onWordsChange={setWords} />
      </div>
      <Button class="w-full" form="list-creator-form" type="submit">
        Create
      </Button>
    </>
  );
};
