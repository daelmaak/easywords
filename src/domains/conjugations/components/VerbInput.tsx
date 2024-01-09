import { Component } from 'solid-js';

interface Props {
  onApplyVerb(verb: string): void;
  ref?: HTMLInputElement;
}

export const VerbInput: Component<Props> = props => {
  const applyVerb = (e: SubmitEvent) => {
    e.preventDefault();

    const verb = new FormData(e.target as HTMLFormElement).get('verb');

    if (!verb) return;

    props.onApplyVerb(verb as string);
  };

  return (
    <form onSubmit={applyVerb}>
      <input
        name="verb"
        class="input"
        placeholder="Verb in infinitive"
        ref={props.ref}
      />
      <button class="ml-2 btn-primary">Search</button>
    </form>
  );
};
