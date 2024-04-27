import { Component, Show, createSignal } from 'solid-js';
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
import { CONJUGATION_LANGS, ConjugationLang } from '~/model/lang';

interface Props {
  lang?: ConjugationLang;
  ref?: HTMLInputElement;
  verbLoading: boolean;
  onApplyVerb(verb: string, lang: ConjugationLang): void;
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

    props.onApplyVerb(verb as string, lang as ConjugationLang);
  };

  return (
    <form onSubmit={applyVerb}>
      <div class="flex gap-2">
        <Select
          name="lang"
          options={CONJUGATION_LANGS}
          placeholder="Language"
          value={props.lang}
          itemComponent={props => (
            <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>
          )}
        >
          <SelectTrigger class="gap-2">
            <SelectValue<string>>{s => s.selectedOption()}</SelectValue>
          </SelectTrigger>
          <SelectHiddenSelect />
          <SelectContent />
        </Select>
        <Input
          name="verb"
          class="input"
          placeholder="Verb in infinitive"
          ref={props.ref}
        />
        <Button loading={props.verbLoading}>Search</Button>
      </div>
      <Show when={invalid()}>
        <p class="mt-2 text-center text-sm text-red-600">
          Fill out both Language and Verb
        </p>
      </Show>
    </form>
  );
};
