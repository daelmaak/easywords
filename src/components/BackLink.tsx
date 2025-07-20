import { A, useLocation, useNavigate } from '@solidjs/router';
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
  const navigate = useNavigate();

  const backPath = () => {
    const prevPathname =
      location.state && 'previous' in location.state
        ? (location.state.previous as string)
        : undefined;
    return local.backTo && prevPathname?.includes(local.backTo)
      ? local.backTo
      : undefined;
  };

  const href = () => {
    return backPath() ?? '..';
  };

  const goBack = (e: Event) => {
    e.preventDefault();
    if (backPath()) {
      window.history.back();
    } else {
      navigate(href());
    }
  };

  return (
    <A
      class={cx(local.class, 'flex items-center text-sm text-inherit')}
      href={href()}
      onClick={goBack}
      {...rest}
    >
      <HiOutlineArrowLeft class="mr-2" size={16} />
      {local.children}
    </A>
  );
};
