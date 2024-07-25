import type { Component } from 'solid-js';
import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { VocabularyItem } from '../model/vocabulary-model';
import { processFormSubmit } from '~/util/form';
import type { WordTranslation } from '~/model/word-translation';

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
    });
  }

  return (
    <form class="flex gap-2" onSubmit={onAddWord}>
      <div class="flex flex-col gap-2">
        <Label class="text-xs" for="word-original">
          Original
        </Label>
        <Input
          id="word-original"
            class="text-base"
          name="original"
          value={props.value?.original}
        />
      </div>
      <div class="flex flex-col gap-2">
        <Label class="text-xs" for="word-translation">
          Translation
        </Label>
        <Input
          id="word-translation"
            class="text-base"
          name="translation"
          value={props.value?.translation}
        />
      </div>
      <Button
        class="ml-auto self-end"
        variant={props.ctaVariant ?? 'default'}
        type="submit"
      >
        {props.ctaLabel}
      </Button>
    </form>
  );
};
