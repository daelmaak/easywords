import { Component } from 'solid-js';
import { VocabularyItem } from '../model/vocabulary-model';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { processFormSubmit } from '~/util/form';
import { Textarea } from '~/components/ui/textarea';

interface Props {
  word: VocabularyItem;
  onChange: (word: VocabularyItem) => void;
}

export const WordEditor: Component<Props> = props => {
  function handleSubmit(e: SubmitEvent) {
    const formData =
      processFormSubmit<
        Pick<VocabularyItem, 'original' | 'translation' | 'notes'>
      >(e);

    if (formData.original == null || formData.translation == null) {
      return;
    }

    const updatedWord = {
      ...props.word,
      ...formData,
    };
    props.onChange(updatedWord);
  }

  return (
    <form class="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div class="flex gap-2">
        <Input
          name="original"
          placeholder="Original"
          value={props.word.original}
        />
        <Input
          name="translation"
          placeholder="Translation"
          value={props.word.translation}
        />
      </div>
      <Textarea
        name="notes"
        placeholder="Notes"
        rows="5"
        value={props.word.notes}
      />
      <Button type="submit">Save</Button>
    </form>
  );
};
