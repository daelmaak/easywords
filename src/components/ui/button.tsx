import type { Component, ComponentProps } from 'solid-js';
import { splitProps } from 'solid-js';

import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

import { cn } from '~/lib/utils';
import { Spinner } from '../Spinner';

import classes from './button.module.css';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        destructiveOutline:
          'bg-destructive/5 border border-destructive text-destructive hover:bg-destructive/0',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        defaultOutline:
          'bg-primary/5 border border-primary text-primary font-semibold hover:bg-primary/0',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 font-normal',
        lg: 'h-11 rounded-md px-8',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button: Component<ButtonProps> = props => {
  const [, local, rest] = splitProps(
    props,
    ['variant', 'size', 'class'],
    ['children', 'loading']
  );
  return (
    <button
      class={cn(
        buttonVariants({ variant: props.variant, size: props.size }),
        'relative',
        props.class,
        classes.button
      )}
      disabled={local.loading}
      {...rest}
    >
      {local.loading && (
        <span class="absolute left-1/2 -translate-x-1/2">
          <Spinner size={'md'} />
        </span>
      )}
      <span
        class="inline-flex items-end gap-1 whitespace-nowrap"
        classList={{
          invisible: local.loading,
        }}
      >
        {local.children}
      </span>
    </button>
  );
};

export { Button, buttonVariants };
