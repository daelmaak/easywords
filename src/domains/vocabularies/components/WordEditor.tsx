import { Component } from 'solid-js';
import { VocabularyItem } from '../model/vocabulary-model';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { processFormSubmit } from '~/util/form';

interface Props {
  word: VocabularyItem;
  onChange: (word: VocabularyItem) => void;
}

export const WordEditor: Component<Props> = props => {
  function handleSubmit(e: SubmitEvent) {
    const formData =
      processFormSubmit<Pick<VocabularyItem, 'original' | 'translation'>>(e);

    if (formData.original == null || formData.translation == null) {
      return;
    }

    const updatedWord = {
      ...props.word,
      original: formData.original,
      translation: formData.translation,
    };
    props.onChange(updatedWord);
  }

  return (
    <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div class="flex gap-2">
        <Input name="original" value={props.word.original} />
        <Input name="translation" value={props.word.translation} />
      </div>
      <Button type="submit">Save</Button>
    </form>
  );
};
