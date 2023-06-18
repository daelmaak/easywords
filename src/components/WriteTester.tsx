import { Show, createEffect, createSignal } from 'solid-js';

export interface WriteTesterProps {
  peek: boolean;
  translation: string;
}

export function WriteTester(props: WriteTesterProps) {
  let inputRef: HTMLInputElement | undefined;
  const [valid, setValid] = createSignal<boolean | undefined>();

  function checkText(text: string) {
    setValid(props.translation.includes(text));
  }

  function onSubmit(e: Event) {
    e.preventDefault();

    const text = inputRef?.value;

    if (!text) {
      return;
    }

    checkText(text);
  }

  // NOTE: executes always when props.translation changes
  createEffect(() => {
    setValid(undefined);
    return props.translation;
  });

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
