import { Show, createEffect, createSignal, onMount } from 'solid-js';

export interface WriteTesterProps {
  peek: boolean;
  translation: string;
  onNextWord: () => void;
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

  function checkText(text: string) {
    setValid(props.translation.includes(text));
  }

  function onSubmit(e: Event) {
    e.preventDefault();

    // Was already validated successfully before. So we can move on to the next word.
    if (valid()) {
      return props.onNextWord();
    }

    const text = inputRef?.value;

    if (!text) {
      return;
    }

    checkText(text);
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
