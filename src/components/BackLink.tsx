import { A, useLocation } from '@solidjs/router';
import { cx } from 'class-variance-authority';
import { HiOutlineArrowLeft } from 'solid-icons/hi';
import type { ComponentProps } from 'solid-js';
import { splitProps, type Component } from 'solid-js';

type Props = ComponentProps<'a'> & {
  backTo?: string;
};

export const BackLink: Component<Props> = props => {
  const [local, rest] = splitProps(props, ['class', 'children', 'backTo']);
  const location = useLocation();

  const previousPathname = () =>
    location.state && 'previous' in location.state
      ? (location.state.previous as string)
      : undefined;
  const href = () => {
    const prevPathname = previousPathname();
    return local.backTo && prevPathname?.includes(local.backTo)
      ? prevPathname
      : '..';
  };

  return (
    <A
      class={cx(local.class, 'flex items-center text-sm text-inherit')}
      href={href()}
      {...rest}
    >
      <HiOutlineArrowLeft class="mr-2" size={16} />
      {local.children}
    </A>
  );
};
