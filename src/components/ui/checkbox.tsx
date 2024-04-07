import type { Component } from 'solid-js';
import { splitProps } from 'solid-js';

import { Checkbox as CheckboxPrimitive } from '@kobalte/core';
import { TbCheck } from 'solid-icons/tb';

import { cn } from '~/lib/utils';

const Checkbox: Component<
  CheckboxPrimitive.CheckboxRootProps & { label?: string }
> = props => {
  const [, local, rest] = splitProps(props, ['class'], ['label']);
  return (
    <CheckboxPrimitive.Root
      class={cn('items-center group flex space-x-2', props.class)}
      {...rest}
    >
      <CheckboxPrimitive.Input />
      <CheckboxPrimitive.Control class="mt-0.5 peer size-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-none data-[checked]:bg-primary data-[checked]:text-primary-foreground cursor-pointer">
        <CheckboxPrimitive.Indicator>
          <TbCheck class="size-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Control>
      <CheckboxPrimitive.Label id={`${rest.id}-input`} class="cursor-pointer">
        {local.label}
      </CheckboxPrimitive.Label>
    </CheckboxPrimitive.Root>
  );
};

export { Checkbox };
