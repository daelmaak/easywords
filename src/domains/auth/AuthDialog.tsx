import { AuthError } from '@supabase/supabase-js';
import { Component, Show, createSignal } from 'solid-js';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { supabase } from '../../lib/supabase-client';
import { Button } from '~/components/ui/button';

type AuthMode = 'signin' | 'signup';

interface Props {
  mode: AuthMode;
  onSignIn: () => void;
  onSignUp: () => void;
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
    <Dialog>
      <DialogTrigger as={Button}>Sign In</DialogTrigger>
      <DialogContent class="w-96 sm:max-w-full"  onPointerDownOutside={e => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>
            {mode() === 'signin' ? 'Sign in' : 'Sign up'}
          </DialogTitle>
        </DialogHeader>
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
          <Button type="submit">
            {mode() === 'signin' ? 'Sign in' : 'Sign up'}
          </Button>
        </form>
        <p class="text-center">
          <Show when={mode() === 'signin'}>
            New here?
            <Button
              class="px-2"
              variant="link"
              onClick={() => changeMode('signup')}
            >
              Create an account.
            </Button>
          </Show>
          <Show when={mode() === 'signup'}>
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
      </DialogContent>
    </Dialog>
  );
};
