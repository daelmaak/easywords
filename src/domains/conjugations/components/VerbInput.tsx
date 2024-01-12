import { Component } from 'solid-js';
import { Button } from '../../../components/Button';

interface Props {
  onApplyVerb(verb: string): void;
  ref?: HTMLInputElement;
  verbLoading: boolean;
}

export const VerbInput: Component<Props> = props => {
  const applyVerb = (e: SubmitEvent) => {
    e.preventDefault();

    const verb = new FormData(e.target as HTMLFormElement).get('verb');

    if (!verb) return;

    props.onApplyVerb(verb as string);
  };

  return (
    <form onSubmit={applyVerb} class="flex">
      <input
        name="verb"
        class="input"
        placeholder="Verb in infinitive"
        ref={props.ref}
      />
      <Button class="ml-2 btn-primary" loading={props.verbLoading}>
        Search
      </Button>
    </form>
  );
};
