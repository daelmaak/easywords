import type { ValidComponent } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import * as CheckboxPrimitive from '@kobalte/core/checkbox';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';

import { cn } from '~/lib/utils';

type CheckboxRootProps<T extends ValidComponent = 'div'> =
  CheckboxPrimitive.CheckboxRootProps<T> & { class?: string | undefined } & {
    label?: string;
  };

const Checkbox = <T extends ValidComponent = 'div'>(
  props: PolymorphicProps<T, CheckboxRootProps<T>>
) => {
  const [local, others] = splitProps(props as CheckboxRootProps, [
    'class',
    'label',
  ]);
  let input!: HTMLInputElement;

  return (
    <CheckboxPrimitive.Root
      class={cn('items-top group relative flex items-center', local.class)}
      {...others}
    >
      <CheckboxPrimitive.Input class="peer" ref={input} />
      <CheckboxPrimitive.Control class="group p-2">
        <div class="size-4 shrink-0 rounded-sm border border-neutral-500 shadow ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 group-data-[checked]:border-none group-data-[indeterminate]:border-none group-data-[checked]:bg-primary group-data-[indeterminate]:bg-primary group-data-[checked]:text-primary-foreground group-data-[indeterminate]:text-primary-foreground">
          <CheckboxPrimitive.Indicator>
            <Show when={!others.indeterminate}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4"
              >
                <path d="M5 12l5 5l10 -10" />
              </svg>
            </Show>
            <Show when={others.indeterminate}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="size-4"
              >
                <path d="M5 12l14 0" />
              </svg>
            </Show>
          </CheckboxPrimitive.Indicator>
        </div>
      </CheckboxPrimitive.Control>
      <CheckboxPrimitive.Label id={`${others.id}-input`}>
        {local.label}
      </CheckboxPrimitive.Label>
    </CheckboxPrimitive.Root>
  );
};

export { Checkbox };
