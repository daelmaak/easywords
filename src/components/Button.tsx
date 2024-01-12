import { Component, JSX, splitProps } from 'solid-js';
import { Spinner } from './Spinner';

interface Props {
  children: JSX.Element;
  class?: string;
  loading?: boolean;
  type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export const Button: Component<Props> = props => {
  const [local, buttonProps] = splitProps(props, [
    'class',
    'children',
    'loading',
  ]);
  return (
    <button
      class="btn-primary relative"
      classList={{
        [props.class ?? '']: true,
      }}
      {...buttonProps}
    >
      {local.loading && (
        <span class="absolute left-1/2 -translate-x-1/2">
          <Spinner size={'md'} />
        </span>
      )}
      <span
        classList={{
          invisible: local.loading,
        }}
      >
        {local.children}
      </span>
    </button>
  );
};
