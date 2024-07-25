import { HiOutlinePlus } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Textarea } from '~/components/ui/textarea';
import type { WordTranslation } from '~/model/word-translation';
import { processFormSubmit } from '~/util/form';
import type { VocabularyItem } from '../model/vocabulary-model';

interface Props {
  ctaLabel: string;
  ctaVariant?: ButtonProps['variant'];
  value?: VocabularyItem;
  onChange: (word: WordTranslation) => void;
}

export const WordCreator: Component<Props> = props => {
  function onAddWord(e: SubmitEvent) {
    const formData =
      processFormSubmit<
        Pick<VocabularyItem, 'original' | 'translation' | 'notes'>
      >(e);

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
    <form class="flex flex-wrap gap-2" onSubmit={onAddWord}>
      <div class="w-full flex gap-2">
        <div class="flex flex-col gap-2">
          <Label class="text-xs" for="word-original">
            Original*
          </Label>
          <Input
            id="word-original"
            class="text-base"
            name="original"
            required
            value={props.value?.original}
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label class="text-xs" for="word-translation">
            Translation*
          </Label>
          <Input
            id="word-translation"
            class="text-base"
            name="translation"
            required
            value={props.value?.translation}
          />
        </div>
      </div>
      <div class="w-full flex flex-col gap-2">
        <Label class="text-xs" for="word-translation">
          Notes
        </Label>
        <Textarea
          id="word-notes"
          name="notes"
          value={props.value?.translation}
        />
      </div>
      <Button
        class="mx-auto w-full"
        variant={props.ctaVariant ?? 'default'}
        type="submit"
      >
        <HiOutlinePlus />
        {props.ctaLabel}
      </Button>
    </form>
  );
};
