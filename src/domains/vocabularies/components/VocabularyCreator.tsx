import { Component, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { WordsInput } from '~/domains/vocabulary-testing/components/WordsInput';
import { WordTranslation } from '~/model/word-translation';

interface Props {
  onListCreate: (name: string, words: WordTranslation[]) => void;
}

export const VocabularyCreator: Component<Props> = props => {
  const [words, setWords] = createSignal<WordTranslation[]>([]);

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
        <Label>Words</Label>
        <WordsInput onWordsChange={setWords} />
      </div>
      <Button class="w-full" form="list-creator-form" type="submit">
        Create
      </Button>
    </>
  );
};
