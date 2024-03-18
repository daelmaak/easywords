import { Component } from 'solid-js';
import { Button, ButtonProps } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { VocabularyItem } from '../vocabulary-model';

interface Props {
  ctaLabel: string;
  ctaVariant?: ButtonProps['variant'];
  value?: VocabularyItem;
  onChange: (word: string, translation: string) => void;
}

export const WordCreator: Component<Props> = props => {
  function onAddWord(e: SubmitEvent) {
    e.preventDefault();

    const formdata = new FormData(e.target as HTMLFormElement);
    let original = formdata.get('original') as string;
    let translation = formdata.get('translation') as string;

    if (!original || !translation) {
      return;
    }

    original = original.trim();
    translation = translation.trim();

    const form = e.target as HTMLFormElement;
    form.reset();
    form.querySelector('input')?.focus();

    props.onChange(original, translation);
  }

  return (
    <form class="flex gap-2" id="words-form-input" onSubmit={onAddWord}>
      <div class="flex flex-col gap-2">
        <Label class="text-xs" for="word-original">
          Original
        </Label>
        <Input
          id="word-original"
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
          name="translation"
          value={props.value?.translation}
        />
      </div>
      <Button
        class="ml-auto self-end"
        form="words-form-input"
        variant={props.ctaVariant ?? 'default'}
        type="submit"
      >
        {props.ctaLabel}
      </Button>
    </form>
  );
};
