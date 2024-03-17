import { HiOutlineCheck, HiOutlineXCircle } from 'solid-icons/hi';
import {
  Component,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js';
import { Input } from '~/components/ui/input';

export interface WriteTesterInstance {
  input: HTMLInputElement;
  validate: () => boolean;
}

export interface WriteTesterProps {
  autoFocus?: boolean;
  peek?: boolean;
  strict?: boolean;
  translation: string;
  validateOnBlur?: boolean;
  onDone?: () => void;
  onPeek?: () => void;
  onReady?: (tester: WriteTesterInstance) => void;
  onValidated?: (valid: boolean, answer: string) => void;
}

export const WriteTester: Component<WriteTesterProps> = props => {
  let inputRef: HTMLInputElement | undefined;
  const [valid, setValidInternal] = createSignal<boolean | undefined>();

  const tokenizedTranslation = createMemo(() => tokenize(props.translation));

  onMount(() => {
    if (!inputRef) {
      return;
    }
    props.onReady?.({ input: inputRef, validate: validateText });
  });

  // NOTE: executes always when props.translation changes
  createEffect(() => {
    if (inputRef) {
      inputRef.value = '';

      if (props.autoFocus) {
        inputRef.focus();
      }
    }
    setValidInternal(undefined);
    return props.translation;
  });

  createEffect(() => {
    if (props.peek && valid() == null) {
      validateText();
    }
  });

  function setValid(valid: boolean, text: string) {
    setValidInternal(valid);
    props.onValidated?.(valid, text);
  }

  function validateText(): boolean {
    const text = inputRef?.value;

    if (!text) {
      setValid(false, '');
      return false;
    }

    const tokenizedText = tokenize(text);
    const valid = tokenizedText.every(t =>
      // TODO: when the accents don't match, I should produce a warning
      tokenizedTranslation().some(tt =>
        props.strict ? tt === t : deaccent(tt) === deaccent(t)
      )
    );
    setValid(valid, text);

    return valid;
  }

  function onBlur() {
    if (!props.validateOnBlur || inputRef?.value === '') {
      return;
    }
    // Call onDone only once
    if (!valid() && validateText()) {
      props.onDone?.();
    }
  }

  function onSubmit(e: Event) {
    e.preventDefault();

    // Was already validated successfully before. So we can move on to the next word.
    if (valid()) {
      return props.onDone?.();
    }

    validateText();

    // NOTE: This handles the case where use resigned on giving an answer. So for his convenience, we let him submit which first
    // shows him the right answer and then it moves to next word on second submit.
    if (inputRef?.value === '') {
      if (props.peek) {
        props.onDone?.();
      } else {
        props.onPeek?.();
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
    <form class="relative flex items-center" onSubmit={onSubmit}>
      <span
        class="absolute left-2 bottom-[-2rem] text-base"
        classList={{ invisible: !props.peek }}
      >
        {props.translation}
      </span>
      <Input ref={inputRef} class="text-lg w-56" type="text" onBlur={onBlur} />
      <button class="invisible" />
      <div class="absolute right-[-1rem] translate-x-full w-8 h-8">
        <Show when={valid() != null}>
          {valid() ? (
            <HiOutlineCheck class="text-primary" size={32} />
          ) : (
            <HiOutlineXCircle class="text-red-500" size={32} />
          )}
        </Show>
      </div>
    </form>
  );
};
