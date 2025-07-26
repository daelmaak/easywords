import { HiOutlineMagnifyingGlass } from 'solid-icons/hi';
import type { Component } from 'solid-js';
import { Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import {
  Select,
  SelectContent,
  SelectHiddenSelect,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { ConjugationLanguageCode } from '~/model/lang';
import { CONJUGATION_LANGUAGES } from '~/model/lang';

interface Props {
  defaultLang?: ConjugationLanguageCode;
  ref?: HTMLInputElement;
  verbLoading: boolean;
  verbNotFound?: boolean;
  onApplyVerb(verb: string, lang: ConjugationLanguageCode): void;
  onLangChange(lang: ConjugationLanguageCode): void;
}

export const VerbInput: Component<Props> = props => {
  const [invalid, setInvalid] = createSignal(false);

  const applyVerb = (e: SubmitEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    const verb = formData.get('verb');
    const lang = formData.get('lang');

    const invalid = !verb || !lang;
    setInvalid(invalid);

    if (invalid) {
      return;
    }

    props.onApplyVerb(verb as string, lang as ConjugationLanguageCode);
  };

  return (
    <form onSubmit={applyVerb}>
      <div class="flex items-center overflow-hidden rounded-md border border-primary bg-white">
        <Select
          name="lang"
          options={Object.keys(CONJUGATION_LANGUAGES)}
          placeholder="Language"
          defaultValue={props.defaultLang}
          itemComponent={props => (
            <SelectItem item={props.item}>
              {CONJUGATION_LANGUAGES[props.item.rawValue]}
            </SelectItem>
          )}
          onChange={lang => props.onLangChange(lang as ConjugationLanguageCode)}
        >
          <SelectTrigger class="gap-2 border-none focus:ring-0 focus:ring-offset-0">
            <SelectValue<string>>
              {s =>
                CONJUGATION_LANGUAGES[
                  s.selectedOption() as ConjugationLanguageCode
                ]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectHiddenSelect />
          <SelectContent />
        </Select>
        <span class="block h-6 w-px bg-primary"></span>
        <Input
          name="verb"
          class="input border-none placeholder:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Infinitive"
          ref={props.ref}
        />
        <Button class="rounded-none" loading={props.verbLoading}>
          <HiOutlineMagnifyingGlass size={20} />
        </Button>
      </div>
      <Show when={invalid()}>
        <p class="mt-2 text-center text-sm text-red-600">
          Fill out both Language and Verb
        </p>
      </Show>
      <Show when={props.verbNotFound}>
        <p class="mt-2 text-center text-sm text-red-600">
          Verb not found. Please check the spelling and try again.
        </p>
      </Show>
    </form>
  );
};
