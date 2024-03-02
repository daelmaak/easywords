import { Component, JSX, splitProps } from 'solid-js';
import { Spinner } from './Spinner';

interface Props extends JSX.CustomEventHandlersCamelCase<HTMLButtonElement> {
  children: JSX.Element;
  class?: string;
  loading?: boolean;
  type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>['type'];
  style?: 'primary' | 'secondary' | 'link';
}

export const Button: Component<Props> = props => {
  const [local, buttonProps] = splitProps(props, [
    'class',
    'children',
    'loading',
  ]);
  const style = () => props.style ?? 'primary';
  return (
    <button
      class="relative"
      classList={{
        [props.class ?? '']: true,
        'btn-primary': style() === 'primary',
        'btn-secondary': style() === 'secondary',
        'btn-link': style() === 'link',
      }}
      {...buttonProps}
    >
      {local.loading && (
        <span class="absolute left-1/2 -translate-x-1/2">
          <Spinner size={'md'} />
        </span>
      )}
      <span
        class="inline-flex items-end gap-1"
        classList={{
          invisible: local.loading,
        }}
      >
        {local.children}
      </span>
    </button>
  );
};
