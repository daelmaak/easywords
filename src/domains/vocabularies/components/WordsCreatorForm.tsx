import type { Component } from 'solid-js';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import type { WordTranslation } from '~/model/word-translation';
import { processFormSubmit } from '~/util/form';
import type { Word } from '../model/vocabulary-model';

interface Props {
  id: string;
  ref?: HTMLFormElement;
  onChange: (word: WordTranslation) => void;
}

export const WordsCreatorForm: Component<Props> = props => {
  function onAddWord(e: SubmitEvent) {
    const formData =
      processFormSubmit<Pick<Word, 'original' | 'translation' | 'notes'>>(e);

    if (formData.original == null || formData.translation == null) {
      return;
    }

    const form = e.target as HTMLFormElement;
    form.reset();
    form.querySelector('input')?.focus();

    props.onChange({
      original: formData.original.trim(),
      translation: formData.translation.trim(),
      notes: formData.notes?.trim(),
    });
  }

  return (
    <form
      class="flex flex-wrap gap-2"
      id={props.id}
      ref={props.ref}
      onSubmit={onAddWord}
    >
      <div class="flex w-full gap-2">
        <div class="flex flex-col gap-2">
          <Label class="text-xs" for="word-original">
            Original*
          </Label>
          <Input id="word-original" name="original" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-xs" for="word-translation">
            Translation*
          </Label>
          <Input id="word-translation" name="translation" required />
        </div>
      </div>
      <div class="flex w-full flex-col gap-2">
        <Label class="text-xs" for="word-translation">
          Notes
        </Label>
        <Textarea id="word-notes" name="notes" />
      </div>
    </form>
  );
};
