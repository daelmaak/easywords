import { A } from '@solidjs/router';
import { cx } from 'class-variance-authority';
import { HiOutlineArrowLeft } from 'solid-icons/hi';
import type { ComponentProps } from 'solid-js';
import { splitProps, type Component } from 'solid-js';

export const BackLink: Component<ComponentProps<'a'>> = props => {
  const [local, rest] = splitProps(props, ['class', 'children']);

  return (
    <A
      class={cx(local.class, 'flex items-center text-sm text-inherit')}
      href=".."
      {...rest}
    >
      <HiOutlineArrowLeft class="mr-2" size={20} />
      {local.children}
    </A>
  );
};
