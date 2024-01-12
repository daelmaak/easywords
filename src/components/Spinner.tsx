import { Component } from 'solid-js';

interface Props {
  class?: string;
  size: 'md' | 'lg';
}

export const Spinner: Component<Props> = props => {
  const widthClass = () => (props.size === 'md' ? 'w-6' : 'w-8');
  const heightClass = () => (props.size === 'md' ? 'h-6' : 'h-8');

  return (
    <svg
      class="spinner"
      classList={{
        [props.class ?? '']: true,
        [widthClass()]: true,
        [heightClass()]: true,
      }}
      viewBox="0 0 50 50"
    >
      <circle cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
  );
};
