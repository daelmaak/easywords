import { Show, createSignal } from 'solid-js';
import { AuthMode } from './model';
import { useLocation } from '@solidjs/router';
import { AuthForm } from './AuthForm';
import logo from '../../assets/logo.svg';

type State = AuthMode | 'signedup';

export const AuthPage = () => {
  const location = useLocation();
  const isLogin = location.pathname.endsWith('login');

  const [state, setState] = createSignal<State>(isLogin ? 'signin' : 'signup');

  const onSignedUp = () => {
    setState('signedup');
  };

  return (
    <div class="h-full w-full bg-gray-200 grid grid-rows-[4rem_auto_6rem]">
      <div class="m-auto flex items-center gap-1">
        <img src={logo} alt="logo" class="size-8 mb-1" />
        <span class="text-2xl font-semibold">Easywords</span>
      </div>

      <div class="m-auto min-w-80 ">
        <Show when={state() === 'signin'}>
          <h1
            class="mb-8 text-3xl font-semibold text-center"
            aria-label="Sign into Easywords"
          >
            Welcome back!
          </h1>
        </Show>
        <Show when={state() === 'signup'}>
          <h1
            class="mb-8 text-3xl font-semibold text-center"
            aria-label="Sign up to Easywords"
          >
            Welcome to Easywords!
          </h1>
        </Show>
        <Show when={state() === 'signedup'}>
          <h1
            class="mb-8 text-3xl font-semibold text-center"
            aria-label="Sign up to Easywords"
          >
            Welcome!
          </h1>
        </Show>

        <div class="bg-white rounded-xl p-4 sm:min-w-96 sm:p-6">
          <Show when={state() === 'signin'}>
            <h2 class="text-lg font-semibold text-center">
              Log into your account
            </h2>
          </Show>
          <Show when={state() === 'signup'}>
            <h2 class="text-lg font-semibold text-center">Create an account</h2>
          </Show>

          <Show
            when={state() !== 'signedup'}
            fallback={<p>Please check your inbox for confirmation email.</p>}
          >
            <AuthForm
              mode={state() as AuthMode}
              onModeChange={setState}
              onSignUp={onSignedUp}
            />
          </Show>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
