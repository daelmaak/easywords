import { useLocation, useNavigate } from '@solidjs/router';
import type { Component, JSX } from 'solid-js';
import { createEffect, Show } from 'solid-js';
import { sessionResource, isLoggedIn } from './auth-resource';

interface IndexProps {
  children?: JSX.Element;
}

export const AuthRouteGuard: Component<IndexProps> = props => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session] = sessionResource;
  const loggedIn = () => isLoggedIn(session());

  createEffect(() => {
    if (loggedIn() == null) return;

    const isAuthRoute =
      location.pathname.endsWith('login') ||
      location.pathname.endsWith('signup');

    if (loggedIn() && isAuthRoute) {
      navigate('/');
    } else if (!loggedIn() && !isAuthRoute) {
      navigate('/login');
    }
  });

  return <Show when={loggedIn() != null}>{props.children}</Show>;
};
