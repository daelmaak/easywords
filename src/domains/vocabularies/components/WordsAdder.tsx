import type { Component } from 'solid-js';
import { createSignal, For } from 'solid-js';
import { Button } from '~/components/ui/button';
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
import type { WordTranslation } from '~/model/word-translation';

interface WordsAdderProps {
  creatingWords: boolean;
  existingWords?: WordTranslation[];
  onCreateWords: (words: WordTranslation[]) => void;
}

const l10n = {
  mode: {
    text: 'raw',
    form: 'interactive',
  },
};

export const WordsAdder: Component<WordsAdderProps> = props => {
  const [wordsInputMode, setWordsInputMode] =
    createSignal<WordsInputMode>('form');
  const [words, setWords] = createSignal<WordTranslation[]>([]);
  let wordsInputFormRef!: HTMLFormElement;

  const handleWordsChange = (newWords: WordTranslation[]) => {
    setWords(newWords);
  };

  const onCreateWords = () => {
    // When no words were added yet, I attempt wordsInputForm submission because maybe
    // the user just didn't press "Add word" button.
    // If there already are some words added, I just check whether the wordsInputForm
    // is submittable, ie. whether it has filled out fields and is valid, and if it is
    // I submit it which adds a word.
    if (words().length === 0 || wordsInputFormRef.checkValidity()) {
      wordsInputFormRef.requestSubmit();
    }

    // If still no words added, even after the form submission, just return. The native
    // form validation will display the error messages.
    if (words().length === 0) {
      return;
    }

    props.onCreateWords(words());
    setWords([]);
  };

  return (
    <>
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
      <WordsInput
        ref={wordsInputFormRef}
        mode={wordsInputMode()}
        onWordsChange={handleWordsChange}
        existingWords={props.existingWords}
      />
      <hr />
      <Button loading={props.creatingWords} onClick={onCreateWords}>
        Save
      </Button>
    </>
  );
};
