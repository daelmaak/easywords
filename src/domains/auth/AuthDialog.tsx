import { Component, Show, createSignal } from 'solid-js';
import { supabase } from '../../lib/supabase-client';
import { Button } from '../../components/Button';
import { AuthError } from '@supabase/supabase-js';

type AuthMode = 'signin' | 'signup';

interface Props {
  mode: AuthMode;
  onSignIn: () => void;
  onSignUp: () => void;
  ref: HTMLDialogElement | undefined;
}

export const AuthDialog: Component<Props> = props => {
  const [authError, setAuthError] = createSignal<AuthError | undefined>();
  const [mode, setMode] = createSignal<AuthMode>(props.mode);

  const changeMode = (newMode: AuthMode) => {
    setMode(newMode);
    setAuthError(undefined);
  };

  const onSubmit = (event: Event) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    if (mode() === 'signup') {
      return signUp(email, password);
    }
    return signIn(email, password);
  };

  const signIn = async (email: string, password: string) => {
    const signInRes = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInRes.error) {
      return setAuthError(signInRes.error);
    }
    props.onSignIn();
  };

  const signUp = async (email: string, password: string) => {
    const signUpRes = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpRes.error) {
      return setAuthError(signUpRes.error);
    }
    props.onSignUp();
  };

  return (
    <dialog ref={props.ref} class="w-80">
      <h2 class="mb-4 text-zinc-200 text-xl text-center">
        {mode() === 'signin' ? 'Sign in' : 'Sign up'}
      </h2>
      <form class="flex flex-col" onSubmit={onSubmit}>
        <label for="email">Email</label>
        <input name="email" id="email" type="email" class="input mt-1 mb-4" />
        <label for="password">Password</label>
        <input
          name="password"
          id="password"
          type="password"
          class="input mt-1 mb-6"
        />
        <Show when={authError()}>
          {error => <span class="text-red-500">{error().message}</span>}
        </Show>
        <Button type="submit">
          {mode() === 'signin' ? 'Sign in' : 'Sign up'}
        </Button>
      </form>
      <p class="mt-4 text-center text-sm">
        <Show when={mode() === 'signin'}>
          New here?{' '}
          <Button style="link" onClick={() => changeMode('signup')}>
            Create an account.
          </Button>
        </Show>
        <Show when={mode() === 'signup'}>
          or{' '}
          <Button style="link" onClick={() => changeMode('signin')}>
            sign into your account.
          </Button>
        </Show>
      </p>
    </dialog>
  );
};
