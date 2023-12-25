import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js';

export interface WriteTesterProps {
  peek: boolean;
  translation: string;
  onNextWord: () => void;
  onPeek: () => void;
  onValidated?: (valid: boolean) => void;
}

export function WriteTester(props: WriteTesterProps) {
  let inputRef: HTMLInputElement | undefined;
  const [valid, setValid] = createSignal<boolean | undefined>();

  onMount(() => {
    inputRef?.focus();
  });

  // NOTE: executes always when props.translation changes
  createEffect(() => {
    if (inputRef) {
      inputRef.value = '';
    }
    setValid(undefined);
    return props.translation;
  });

  createEffect(() => {
    if (props.peek && valid() == null) {
      validateText();
    }
  });

  const tokenizedTranslation = createMemo(() => tokenize(props.translation));

  function validateText() {
    const text = inputRef?.value;

    if (!text) {
      props.onValidated?.(false);
      return;
    }

    const tokenizedText = tokenize(text);
    const valid = tokenizedText.every(t =>
      // TODO: when the accents don't match, I should produce a warning
      tokenizedTranslation().some(tt => deaccent(tt) === deaccent(t))
    );
    setValid(valid);

    props.onValidated?.(valid);
  }

  function onSubmit(e: Event) {
    e.preventDefault();

    // Was already validated successfully before. So we can move on to the next word.
    if (valid()) {
      return props.onNextWord();
    }

    validateText();

    // NOTE: This handles the case where use resigned on giving an answer. So for his convenience, we let him submit which first
    // shows him the right answer and then it moves to next word on second submit.
    if (inputRef?.value === '') {
      if (props.peek) {
        props.onNextWord();
      } else {
        props.onPeek();
      }
    }
  }

  function tokenize(text: string) {
    return text.split(/[\s,\/]+/);
  }

  function deaccent(word: string) {
    return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  return (
    <form class="relative whitespace-nowrap" onSubmit={onSubmit}>
      <span
        class="absolute left-2 top-[-2rem] text-base"
        classList={{ invisible: !props.peek && !valid() }}
      >
        {props.translation}
      </span>
      <input ref={inputRef} class="input w-60" type="text" />
      <button class="invisible" />
      <Show when={valid() != null}>
        <span class="ml-2">
          {valid() ? <i class="text-green-600">✓</i> : <i>❌</i>}
        </span>
      </Show>
    </form>
  );
}
