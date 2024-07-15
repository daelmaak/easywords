import type { AuthError } from '@supabase/supabase-js';
import type { Component} from 'solid-js';
import { Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { signIn, signUp } from './auth-resource';
import type { AuthMode } from './model';

interface Props {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSignUp?: () => void;
}

export const AuthForm: Component<Props> = props => {
  const [authError, setAuthError] = createSignal<AuthError | undefined>();
  const [pending, setPending] = createSignal(false);

  const changeMode = (newMode: AuthMode) => {
    props.onModeChange(newMode);
    setAuthError(undefined);
  };

  const onSignIn = async (email: string, password: string) => {
    const signInResult = await signIn(email, password);

    if (signInResult.error) {
      return setAuthError(signInResult.error);
    }
  };

  const onSignUp = async (email: string, password: string) => {
    const signUpRes = await signUp(email, password);

    if (signUpRes.error) {
      return setAuthError(signUpRes.error);
    }

    props.onSignUp?.();
  };

  const onSubmit = async (event: Event) => {
    event.preventDefault();

    setPending(true);

    const form = event.target as HTMLFormElement;
    const email = form.email.value;
    const password = form.password.value;

    if (props.mode === 'signup') {
      await onSignUp(email, password);
    } else {
      await onSignIn(email, password);
    }

    setPending(false);
  };

  return (
    <>
      <form class="grid gap-4 pt-4" onSubmit={onSubmit}>
        <div class="mb-4 flex flex-col gap-2">
          <Label for="email">Email</Label>
          <Input name="email" id="email" type="email" class="col-span-3" />
        </div>
        <div class="mb-4 flex flex-col gap-2">
          <Label for="password">Password</Label>
          <Input
            name="password"
            id="password"
            type="password"
            class="col-span-3"
          />
        </div>
        <Show when={authError()}>
          {error => <span class="text-red-500">{error().message}</span>}
        </Show>
        <Button type="submit" loading={pending()}>
          {props.mode === 'signin' ? 'Sign in' : 'Sign up'}
        </Button>
      </form>
      <p class="text-center">
        <Show when={props.mode === 'signin'}>
          New here?
          <Button
            class="px-2"
            variant="link"
            onClick={() => changeMode('signup')}
          >
            Create an account.
          </Button>
        </Show>
        <Show when={props.mode === 'signup'}>
          or
          <Button
            class="px-2"
            variant="link"
            onClick={() => changeMode('signin')}
          >
            sign into your account.
          </Button>
        </Show>
      </p>
    </>
  );
};
