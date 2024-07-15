import type { ValidComponent } from 'solid-js';
import { Show, splitProps } from 'solid-js';

import * as CheckboxPrimitive from '@kobalte/core/checkbox';
import type { PolymorphicProps } from '@kobalte/core/polymorphic';

import { cn } from '~/lib/utils';
import { HiOutlineMinus } from 'solid-icons/hi';

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
  return (
    <CheckboxPrimitive.Root
      class={cn('items-top group flex items-center space-x-2', local.class)}
      {...others}
    >
      <CheckboxPrimitive.Input class="peer" />
      <CheckboxPrimitive.Control class="size-4 shrink-0 rounded-sm border border-primary ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 data-[checked]:border-none data-[checked]:bg-primary data-[checked]:text-primary-foreground">
        <CheckboxPrimitive.Indicator class="flex justify-center">
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
            <HiOutlineMinus class="size-4" />
          </Show>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Control>
      <CheckboxPrimitive.Label id={`${others.id}-input`}>
        {local.label}
      </CheckboxPrimitive.Label>
    </CheckboxPrimitive.Root>
  );
};

export { Checkbox };
