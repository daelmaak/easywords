import { useNavigate } from '@solidjs/router';
import { Component, createEffect, JSX, Show } from 'solid-js';
import { sessionResource, isLoggedIn } from './auth-resource';

interface IndexProps {
  children?: JSX.Element;
}

export const AuthRouteGuard: Component<IndexProps> = props => {
  const navigate = useNavigate();
  const [session] = sessionResource;
  const loggedIn = () => isLoggedIn(session());

  createEffect(() => {
    if (loggedIn() == null) return;

    if (loggedIn()) {
      navigate('/');
    } else {
      navigate('/login');
    }
  });

  return <Show when={loggedIn() != null}>{props.children}</Show>;
};
