import { Component } from 'solid-js';
import style from './Spinner.module.css';
import { cn } from '~/lib/utils';

interface Props {
  size: 'md' | 'lg';
}

export const Spinner: Component<Props> = props => {
  const sizeClass = () => (props.size === 'md' ? 'size-6' : 'size-8');

  return (
    <svg class={cn('animate-spin', sizeClass())} viewBox="0 0 50 50">
      <circle
        class={style.circle}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        stroke-width="5"
      ></circle>
    </svg>
  );
};
