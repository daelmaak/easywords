import { cx } from 'class-variance-authority';
import {
  HiOutlineArrowRight,
  HiOutlineCheck,
  HiOutlineForward,
  HiOutlineXCircle,
} from 'solid-icons/hi';
import type { Component } from 'solid-js';
import {
  Show,
  createEffect,
  createMemo,
  createSignal,
  onMount,
} from 'solid-js';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import type { Word } from '~/domains/vocabularies/model/vocabulary-model';

export interface WriteTesterInstance {
  input: HTMLInputElement;
  validate: () => boolean;
}

// The id is optional since not all words have to have an id, like conjugations
type TestedWord = Pick<Word, 'translation'> & { id?: number };

export interface WriteTesterProps {
  autoFocus?: boolean;
  mode: 'full' | 'inline';
  peek?: boolean;
  strict?: boolean;
  word: TestedWord;
  validateOnBlur?: boolean;
  onDone?: () => void;
  onReady?: (tester: WriteTesterInstance) => void;
  onSkip?: () => void;
  onValidated?: (valid: boolean, answer: string) => void;
}

export const WriteTester: Component<WriteTesterProps> = props => {
  let inputRef: HTMLInputElement | undefined;
  const [valid, setValidInternal] = createSignal<boolean | undefined>();
  const [freshlyInvalid, setFreshlyInvalid] = createSignal(false);

  const tokenizedTranslation = createMemo(() =>
    tokenize(props.word.translation.toLocaleLowerCase())
  );

  const isPrimaryBtnSubmitter = () => !valid() && !freshlyInvalid();
  const isSkipBtnSubmitter = () => valid() || freshlyInvalid();

  onMount(() => {
    if (!inputRef) {
      return;
    }
    props.onReady?.({ input: inputRef, validate: validateText });
  });

  createEffect((previousWord: TestedWord | undefined) => {
    // A word can be updated from the outside but that should cause no changes
    // here.
    if (previousWord?.id != null && previousWord.id === props.word.id) {
      return props.word;
    }

    if (inputRef) {
      inputRef.value = '';

      if (props.autoFocus) {
        inputRef.focus();
      }
    }
    setValidInternal(undefined);
    setFreshlyInvalid(false);

    return props.word;
  });

  createEffect(() => {
    if (props.peek && valid() == null) {
      validateText();
    }
  });

  function setValid(valid: boolean, text: string) {
    if (!valid) {
      setFreshlyInvalid(true);
    }
    setValidInternal(valid);
    props.onValidated?.(valid, text);
  }

  function validateText(): boolean {
    const text = inputRef?.value.toLowerCase();

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

  function onInput() {
    setFreshlyInvalid(false);
  }

  function onSubmit(e: SubmitEvent) {
    e.preventDefault();

    // Was already validated successfully before. So we can move on to the next word.
    if (valid()) {
      return props.onDone?.();
    }

    const goNext = e.submitter?.title === 'Next word';

    if (!goNext) {
      validateText();
    }

    // NOTE: This handles the case where use resigned on giving an answer. So for his convenience, we let him submit which first
    // shows him the right answer and then it moves to next word on second submit.
    if (goNext) {
      props.onDone?.();
    }
  }

  function tokenize(text: string) {
    return text.split(/[\s,/]+/);
  }

  function deaccent(word: string) {
    return word.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }

  return (
    <div class="relative">
      <i
        class={cx('block mb-2 mx-auto text-lg text-center', {
          invisible: !props.peek,
          'absolute top-0 translate-y-[-75%]': props.mode === 'inline',
        })}
        role="alert"
        aria-label={'The correct answer is: ' + props.word.translation}
        aria-live="polite"
      >
        {props.word.translation}
      </i>
      <form
        class="flex flex-col justify-center items-center gap-2 sm:flex-row"
        onSubmit={onSubmit}
      >
        <div class="flex items-center gap-2">
          <div
            class={cx('w-8 h-8', {
              'order-1': props.mode === 'inline',
            })}
          >
            <Show when={valid() != null}>
              {valid() ? (
                <HiOutlineCheck
                  aria-label="Word guess is valid"
                  class="text-primary"
                  size={32}
                />
              ) : (
                <HiOutlineXCircle
                  aria-label="Word guess is invalid"
                  class="text-red-500"
                  size={32}
                />
              )}
            </Show>
          </div>
          <Input
            ref={inputRef}
            class="w-56 text-lg"
            type="text"
            data-testid="write-tester-input"
            onBlur={onBlur}
            onInput={onInput}
          />
          <div aria-hidden class="w-8 h-8 sm:hidden"></div>
        </div>
        <Show when={props.mode === 'full'}>
          <div class="flex gap-2">
            <Button
              class="px-2"
              aria-label="Check word"
              title="Check word"
              disabled={isSkipBtnSubmitter()}
              type={isPrimaryBtnSubmitter() ? 'submit' : 'button'}
            >
              <HiOutlineArrowRight size={24} />
            </Button>
            <Button
              class="px-2"
              variant={valid() ? 'default' : 'secondary'}
              aria-label="Next word"
              title="Next word"
              type={isSkipBtnSubmitter() ? 'submit' : 'button'}
              onClick={isSkipBtnSubmitter() ? undefined : props.onSkip}
            >
              <HiOutlineForward
                class={cx(!valid() && 'opacity-75')}
                size={24}
              />
            </Button>
          </div>
        </Show>
      </form>
    </div>
  );
};
