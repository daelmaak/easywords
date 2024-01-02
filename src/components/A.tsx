import { useSearchParams } from '@solidjs/router';
import { Component, JSX } from 'solid-js';
import { createSearchString } from '../util/routing';

interface Props extends JSX.HTMLAttributes<HTMLAnchorElement> {
  children: JSX.Element;
  href: string;
}

export const A: Component<Props> = props => {
  const [searchParams] = useSearchParams();

  return (
    <a {...props} href={props.href + createSearchString(searchParams)}>
      {props.children}
    </a>
  );
};
