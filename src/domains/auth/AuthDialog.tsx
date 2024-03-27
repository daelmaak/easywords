import { Component, Show, createSignal } from 'solid-js';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { AuthForm } from './AuthForm';
import { AuthMode } from './model';

interface Props {
  mode: AuthMode;
  onSignIn?: () => void;
  onSignUp?: () => void;
}

export const AuthDialog: Component<Props> = props => {
  const [mode, setMode] = createSignal<AuthMode>(props.mode);
  const [signedUp, setSignedUp] = createSignal(false);

  const onSignUp = () => {
    setSignedUp(true);
    props.onSignUp?.();
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button size="sm" variant="outline">
          Sign In
        </Button>
      </DialogTrigger>
      <DialogContent
        class="w-96 sm:max-w-full"
        onPointerDownOutside={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mode() === 'signin' ? 'Sign in' : 'Sign up'}
          </DialogTitle>
        </DialogHeader>
        <Show
          when={!signedUp()}
          fallback={<p>Please check your inbox for confirmation email.</p>}
        >
          <AuthForm
            mode={mode()}
            onModeChange={setMode}
            onSignIn={props.onSignIn}
            onSignUp={onSignUp}
          />
        </Show>
      </DialogContent>
    </Dialog>
  );
};
