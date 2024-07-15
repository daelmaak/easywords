import type { Component, JSX} from 'solid-js';
import { Show, createSignal } from 'solid-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { AuthForm } from './AuthForm';
import type { AuthMode } from './model';

interface Props {
  mode: AuthMode;
  trigger?: JSX.Element;
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
      <DialogTrigger>{props.trigger}</DialogTrigger>
      <DialogContent
        class="w-80 sm:w-96 sm:max-w-full"
        onInteractOutside={e => e.preventDefault()}
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
          <AuthForm mode={mode()} onModeChange={setMode} onSignUp={onSignUp} />
        </Show>
      </DialogContent>
    </Dialog>
  );
};
